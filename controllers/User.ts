import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import userSuccess from "../controllers/UserSuccess";

import { AuthenticatedRequest } from "../middlewares/idValidation";

import { prisma } from "../utils/prismaClient";
import { generateAccessToken } from "../utils/auth/generateAccessToken";
import { createUserSuccess } from "../utils/createUserSuccess";

//* POST
export const signup = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const normalizedUsername: string = username.toLowerCase();

    try {
        const existingUsername = await prisma.users.findUnique({ where: { username: normalizedUsername } });
        const existingEmail = await prisma.users.findUnique({ where: { email } });

        if (existingUsername != null) {
            return res.status(400).json({ erreur: "Le nom d'utilisateur existe déjà" });
        }

        if (existingEmail != null) {
            return res.status(400).json({ erreur: "L'email existe déjà" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                username: normalizedUsername,
                email,
                password: hashedPassword,
                pp: "/assets/avatars/Icon1.png",
            },
            select: {
                id: true,
                username: true,
                email: true,
                pp: true,
                banner: true,
                createdAt: true,
            },
        });

        await createUserSuccess(user.id);

        const accessToken = await generateAccessToken(user.id);

        return res.status(201).json({
            user,
            message: "Inscription réussie! 🥳🎊",
            accessToken: accessToken,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ erreur: error });
    }
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const normalizedUsername: string = username.toLowerCase();

    try {
        const user = await prisma.users.findUnique({
            where: { username: normalizedUsername },
            select: {
                id: true,
                username: true,
                email: true,
                pp: true,
                createdAt: true,
                password: true,
            },
        });

        if (user === null) {
            return res.status(401).json({ erreur: "Identifiants non valides 😢" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        const accessToken = await generateAccessToken(user.id);

        if (passwordMatch) {
            const { password: _, ...userWithoutPassword } = user;

            return res.status(200).json({
                user: userWithoutPassword,
                message: "Connexion réussie! 🥳",
                accessToken: accessToken,
            });
        } else {
            return res.status(401).json({ erreur: "Identifiants non valides 😢" });
        }
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ erreur: error });
    }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            throw Object.assign(new Error("Pas de token, pas d'autorisation"), { status: 401 });
        }

        const decodedToken = jwt.verify(token as string, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;

        const userId = decodedToken.userId as string;

        const user = await prisma.users.findUnique({ where: { id: parseInt(userId, 10) } });

        if (!user) {
            throw Object.assign(new Error("Erreur d'authentification"), { status: 401 });
        }

        const refreshedToken = await generateAccessToken(parseInt(userId, 10));
        res.status(200).send({ accessToken: refreshedToken });
    } catch (error: any) {
        console.log(error.message);
        return res.status(error.status || 500).json({ erreur: error.message });
    }
};

//* GET
export const getUser = async (req: AuthenticatedRequest, res: Response) => {
    const userId: string = req.params.userId;

    if (isNaN(parseInt(userId, 10))) {
        res.status(400).json({ erreur: "Le paramètre userId doit être un nombre valide" });
        return;
    }

    try {
        const user = await prisma.users.findUnique({ where: { id: parseInt(userId, 10) } });

        if (user === null) {
            return res.status(404).json({ erreur: "Utilisateur non trouvé 😢" });
        }

        res.status(200).json({
            id: user.id,
            pp: user.pp,
            banner: user.banner,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
        });
    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ erreur: error });
    }
};

//* PATCH
export const editUsernameOrEmail = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const { username, email } = req.body;
    const normalizedUsername: string = username?.toLowerCase();

    try {
        const formerUser = await prisma.users.findUnique({ where: { id: parseInt(userId, 10) } });

        if (normalizedUsername === formerUser?.username && email === formerUser?.email) {
            throw new Error("Les nouveaux username et email sont identiques aux précédents");
        }

        if (normalizedUsername === undefined && email === undefined) {
            throw new Error("L'username et l'email sont undefined");
        }

        if (normalizedUsername === formerUser?.username && email === undefined) {
            throw new Error("Le nouvel username est identique au précédent et l'email est undefined");
        }

        if (email === formerUser?.email && normalizedUsername === undefined) {
            throw new Error("Le nouvel email est identique au précédent et l'username est undefined");
        }

        if (normalizedUsername !== undefined) {
            const existingUsername = await prisma.users.findUnique({ where: { username: normalizedUsername } });

            if (existingUsername !== null && existingUsername.username !== formerUser?.username) {
                return res.status(400).json({ details: "Le nom d'utilisateur existe déjà" });
            }
        }

        if (email !== undefined) {
            const existingEmail = await prisma.users.findUnique({ where: { email } });

            if (existingEmail !== null && existingEmail.email !== formerUser?.email) {
                console.log(formerUser?.email);
                return res.status(400).json({ details: "L'email existe déjà" });
            }
        }

        const updatedUser = await prisma.users.update({
            where: {
                id: parseInt(userId, 10),
            },
            data: {
                username: normalizedUsername ? { set: normalizedUsername } : undefined,
                email: email ? { set: email } : undefined,
            },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });

        return res.json({ message: "Informations de l'utilisateur modifiées avec succès", updatedUser });
    } catch (error: any) {
        console.log(error.message);
        return res.status(400).json({ details: "Les informations de l'utilisateur n'ont pas été modifiées. Plus d'informations en console" });
    }
};

export const editPassword = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const { formerPassword, newPassword } = req.body;

    try {
        if (formerPassword === undefined) {
            throw Object.assign(new Error(), {
                status: 400,
                details: "Ancien mot de passe absent de la requête",
            });
        }

        const user = await prisma.users.findUnique({ where: { id: parseInt(userId, 10) } });

        if (user === null) {
            return res.status(401).json({ erreur: "Utilisateur introuvable" });
        }

        const passwordMatch = await bcrypt.compare(formerPassword, user.password);

        if (passwordMatch) {
            if (formerPassword === newPassword) {
                throw new Error("Le nouveau mot de passe est identique au précédent");
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await prisma.users.update({
                where: {
                    id: parseInt(userId, 10),
                },
                data: {
                    password: hashedNewPassword,
                },
            });

            return res.status(200).json({ message: "Mot de passe modifié avec succès" });
        } else {
            throw Object.assign(new Error(), {
                status: 401,
                details: "Mot de passe incorrect",
            });
        }
    } catch (error: any) {
        console.log(error.message);
        const { status, ...errorWithoutStatus } = error;
        return res.status(error.status || 500).json(errorWithoutStatus);
    }
};

export const editPicture = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const pictureNumber = req.body.pictureNumber;

    try {
        if (pictureNumber < 1 || pictureNumber > 48) {
            throw Object.assign(new Error(), {
                status: 400,
                details: "L'image n'existe pas",
            });
        }

        const newPicture = `/assets/avatars/Icon${req.body.pictureNumber}.png`;

        const updatedUser = await prisma.users.update({
            where: {
                id: parseInt(userId, 10),
            },
            data: {
                pp: newPicture,
            },
            select: {
                id: true,
                pp: true,
            },
        });

        return res.json({ message: "L'image de profil a bien été modifiée !", updatedUser });
    } catch (error: any) {
        console.log(error.message);
        const { status, ...errorWithoutStatus } = error;
        return res.status(error.status || 500).json(errorWithoutStatus);
    }
};

//* DELETE
export const deleteUser = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const { password } = req.body;

    try {
        if (password === undefined) {
            throw Object.assign(new Error(), {
                status: 400,
                details: "Mot de passe requis",
            });
        }

        const user = await prisma.users.findUnique({ where: { id: parseInt(userId, 10) } });

        if (user === null) {
            throw Object.assign(new Error(), {
                status: 401,
                details: "Utilisateur introuvable",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            await prisma.userSuccess.deleteMany({
                where: {
                    userId: parseInt(userId, 10),
                },
            });

            await prisma.userTasks.deleteMany({
                where: {
                    userId: parseInt(userId, 10),
                },
            });

            await prisma.yol.deleteMany({
                where: {
                    userId: parseInt(userId, 10),
                },
            });

            await prisma.users.delete({
                where: {
                    id: parseInt(userId, 10),
                },
            });

            return res.status(200).json({ message: "L'utilisateur a bien été supprimé" });
        } else {
            throw Object.assign(new Error(), {
                status: 401,
                details: "Mot de passe incorrect",
            });
        }
    } catch (error: any) {
        console.log(error.message);
        return res.status(error.status || 500).json({ details: error.details });
    }
};

export default {
    signup,
    login,
    refreshAccessToken,
    getUser,
    editUsernameOrEmail,
    editPassword,
    editPicture,
    deleteUser,
};
