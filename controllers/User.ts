import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import userSuccess from "../controllers/UserSuccess";

import { AuthenticatedRequest } from "../middlewares/idValidation";

import { prisma } from "../utils/prismaClient";
import { generateAccessToken } from "../utils/auth/generateAccessToken";
import { createUserSuccess } from "../utils/createUserSuccess";

//* POST
export const signup = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // we store username as lowercase to prevent mismatches
    const normalizedUsername: string = username.toLowerCase();

    try {
        // check if the username or email already exist
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [{ username: normalizedUsername }, { email: email }],
            },
        });

        // 409 is status code for conflict which is the right status code
        // when you're trying to add a resource
        if (existingUser) {
            throw Object.assign(new Error(), {
                status: 409,
                message:
                    existingUser.username === normalizedUsername
                        ? "Le nom d'utilisateur n'est pas disponible"
                        : "L'email renseigné n'est pas disponible",
            });
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
            accessToken: accessToken,
        });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

export const login = async (req: Request, res: Response) => {
    const { username, password }: { username: string; password: string } = req.body;

    const normalizedUsername: string = username.toLowerCase();

    try {
        if (!username || !password) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Username et/ou mot de passe absent(s) de la requête",
            });
        }

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

        // if one or both conditions are false, throw an error.
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw Object.assign(new Error(), {
                status: 401,
                message: "Identifiants non valides",
            });
        }

        const accessToken = await generateAccessToken(user.id);

        // we destruct user object to create another one
        // without the password field
        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            user: userWithoutPassword,
            accessToken: accessToken,
        });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            throw Object.assign(new Error(), {
                status: 401,
                message: "Erreur d'authentification",
            });
        }

        const decodedToken = jwt.verify(token as string, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;

        const userId = decodedToken.userId as string;

        const user = await prisma.users.findUnique({ where: { id: parseInt(userId, 10) } });

        if (!user) {
            throw Object.assign(new Error(), {
                status: 401,
                message: "Erreur d'authentification",
            });
        }

        const refreshedToken = await generateAccessToken(parseInt(userId, 10));

        res.status(200).send({ accessToken: refreshedToken });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

//* GET
export const getUser = async (req: AuthenticatedRequest, res: Response) => {
    const userId: string = req.params.userId;

    try {
        if (!userId) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId est absent du corps de la requête",
            });
        }

        if (isNaN(parseInt(userId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId doit être un nombre valide",
            });
        }

        const user = await prisma.users.findUnique({
            where: { id: parseInt(userId, 10) },
            select: { id: true, pp: true, banner: true, email: true, username: true, createdAt: true },
        });

        if (!user) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Utilisateur non trouvé",
            });
        }

        res.status(200).json({ ...user });
    } catch (error: any) {
        res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

//* PATCH
// todo: find a way to show every error if there's multiple errors message
export const editUsernameOrEmail = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const { username, email } = req.body;

    const normalizedNewUsername: string = username.toLowerCase();
    const newEmail: string = email;

    try {
        if (!userId || isNaN(parseInt(userId, 10)) || !username || !email) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Paramètres de requête invalides",
            });
        }

        const formerUser = await prisma.users.findUnique({ where: { id: parseInt(userId, 10) } });

        if (!formerUser) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Utilisateur introuvable",
            });
        }

        if (normalizedNewUsername === formerUser.username && email === formerUser.email) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Les nouveaux username et email sont identiques aux précédents",
            });
        }

        if (normalizedNewUsername === formerUser.username) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "le nouveau nom d'utilisateur est identique au précedent",
            });
        }

        if (email === formerUser.email) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le nouvel email est identique au précedent",
            });
        }

        // search the new username in database, if it already exist, we throw an error
        const existingUsername = await prisma.users.findUnique({ where: { username: normalizedNewUsername } });

        if (existingUsername && existingUsername.username !== formerUser.username) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Ce nom d'utilisateur n'est pas disponible",
            });
        }

        // search the new email in database, if it already exist, we throw an error
        const existingEmail = await prisma.users.findUnique({ where: { email: newEmail }, select: { email: true } });

        if (existingEmail && existingEmail.email !== formerUser.email) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Cette adresse email est déjà utilisée par un autre utilisateur",
            });
        }

        const updatedUser = await prisma.users.update({
            where: {
                id: parseInt(userId, 10),
            },
            data: {
                username: normalizedNewUsername ? { set: normalizedNewUsername } : undefined,
                email: newEmail ? { set: newEmail } : undefined,
            },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });

        return res.status(200).json({ updatedUser });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

export const editPassword = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const { formerPassword, newPassword }: { formerPassword: string; newPassword: string } = req.body;

    try {
        if (!userId || isNaN(parseInt(userId, 10)) || !formerPassword || !newPassword) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Paramètres de requête invalides",
            });
        }

        if (formerPassword === newPassword) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le nouveau mot de passe ne peut pas être identique au précédent",
            });
        }

        const user = await prisma.users.findUnique({ where: { id: parseInt(userId, 10) } });

        if (!user) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Utilisateur introuvable",
            });
        }

        const passwordMatch = await bcrypt.compare(formerPassword, user.password);

        if (!passwordMatch) {
            throw Object.assign(new Error(), {
                status: 401,
                message: "Mot de passe incorrect",
            });
        } else if (passwordMatch) {
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await prisma.users.update({
                where: {
                    id: parseInt(userId, 10),
                },
                data: {
                    password: hashedNewPassword,
                },
            });

            // return a 204 status code to say we proceeded the request
            // but there's nothing to return
            return res.status(204).send();
        }
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

export const editPicture = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const pictureNumber: number = req.body.pictureNumber;

    if (!userId || !pictureNumber) {
        throw Object.assign(new Error(), {
            status: 400,
            message: "Des paramètres sont absents de la requête (param: userId, body: pictureNumber)",
        });
    }

    if (isNaN(parseInt(userId, 10))) {
        throw Object.assign(new Error(), {
            status: 400,
            message: "Le paramètre userId doit être un nombre valide",
        });
    }

    try {
        if (pictureNumber < 1 || pictureNumber > 48) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Image introuvable",
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

        if (!updatedUser) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Utilisateur introuvable",
            });
        }

        return res.status(200).json({ updatedUser });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

//* DELETE
export const deleteUser = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const { password } = req.body;

    try {
        if (!userId) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId est absent du corps de la requête",
            });
        }

        if (isNaN(parseInt(userId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId doit être un nombre valide",
            });
        }

        if (!password) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Mot de passe requis",
            });
        }

        const user = await prisma.users.findUnique({ where: { id: parseInt(userId, 10) } });

        if (!user) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Utilisateur introuvable",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Mot de passe incorrect",
            });
        } else if (passwordMatch) {
            await prisma.$transaction([
                prisma.userSuccess.deleteMany({
                    where: {
                        userId: parseInt(userId, 10),
                    },
                }),
                prisma.userTasks.deleteMany({
                    where: {
                        userId: parseInt(userId, 10),
                    },
                }),
                prisma.yol.deleteMany({
                    where: {
                        userId: parseInt(userId, 10),
                    },
                }),
                prisma.users.delete({
                    where: {
                        id: parseInt(userId, 10),
                    },
                }),
            ]);

            return res.status(204).send();
        }
    } catch (error: any) {
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
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
