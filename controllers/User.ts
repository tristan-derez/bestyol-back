import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

import { AuthenticatedRequest } from "../middlewares/idValidation";

import { Users, prisma } from "../utils/prismaClient";
import { generateAccessToken } from "../utils/auth/generateAccessToken";

//* POST
export const signup = async (req: Request, res: Response) => {
    const { username, email, password }: { username: string; email: string; password: string } = req.body;

    // we store username as lowercase to prevent mismatches
    const normalizedUsername: string = username.toLowerCase();
    const normalizedEmail: string = email.toLowerCase();

    try {
        // first, check if username or email already exist
        const existingUsername = await prisma.users.findUnique({ where: { username: normalizedUsername }, select: { username: true } });
        const existingEmail = await prisma.users.findUnique({ where: { email: normalizedEmail }, select: { email: true } });

        if (existingUsername && existingEmail) {
            const errorMessage = `Le nom d'utilisateur et l'email ne sont pas disponibles`;
            throw Object.assign(new Error(), {
                status: 409,
                message: errorMessage,
            });
        }

        if (existingUsername || existingEmail) {
            const errorMessage = existingUsername ? "Le nom d'utilisateur n'est pas disponible" : "L'email n'est pas disponible";
            throw Object.assign(new Error(), {
                status: 409,
                message: errorMessage,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // to generate a random number that will be used to pick a random profil picture
        const randomNumber = Math.floor(Math.random() * (48 - 1 + 1)) + 1;

        // create an user and all its userSuccess
        await prisma.$transaction(async (prisma) => {
            const user = await prisma.users.create({
                data: {
                    username: normalizedUsername,
                    email: normalizedEmail,
                    password: hashedPassword,
                    pp: `/assets/avatars/Icon${randomNumber}.png`,
                },
            });

            const allSuccess = await prisma.success.findMany();

            for (const success of allSuccess) {
                await prisma.userSuccess.create({
                    data: {
                        actualAmount: 0,
                        isCompleted: false,
                        userId: user.id,
                        successId: success.id,
                    },
                });
            }
        });

        // get the newly created user without the password field
        const createdUser = await prisma.users.findUnique({
            where: {
                username: normalizedUsername,
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

        if (!createdUser) {
            throw Object.assign(new Error(), {
                status: 500,
                message: "Erreur interne",
            });
        }

        const accessToken = await generateAccessToken(createdUser.id);

        return res.status(201).json({
            user: createdUser,
            accessToken: accessToken,
        });
    } catch (error: any) {
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
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

        const user: Users | null = await prisma.users.findUnique({
            where: { username: normalizedUsername },
            select: {
                id: true,
                username: true,
                email: true,
                pp: true,
                banner: true,
                createdAt: true,
                updatedAt: true,
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

        const accessToken: string = await generateAccessToken(user.id);

        // we destruct user object to create another one
        // without the password field
        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            user: userWithoutPassword,
            accessToken: accessToken,
        });
    } catch (error: any) {
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
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
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
    }
};

//* GET
export const getUser = async (req: AuthenticatedRequest, res: Response) => {
    const userId: number = Number(req.params.userId);

    try {
        if (!userId || isNaN(userId)) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId est absent de la requête ou n'est pas un nombre valide",
            });
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
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
        res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
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
                message: "Utilisateur non trouvé",
            });
        }

        // Check if the new username is taken by another user
        if (normalizedNewUsername !== formerUser.username) {
            const existingUserWithNewUsername = await prisma.users.findUnique({
                where: { username: normalizedNewUsername },
            });

            if (existingUserWithNewUsername) {
                throw Object.assign(new Error(), {
                    status: 404,
                    message: "Ce nom d'utilisateur n'est pas disponible",
                });
            }
        }

        // Check if the new email is taken by another user
        if (newEmail !== formerUser.email) {
            const existingUserWithNewEmail = await prisma.users.findUnique({
                where: { email: newEmail },
            });

            if (existingUserWithNewEmail) {
                throw Object.assign(new Error(), {
                    status: 404,
                    message: "Cette adresse e-mail n'est pas disponible",
                });
            }
        }

        // Update the user's username and email
        const updatedUser = await prisma.users.update({
            where: { id: formerUser.id },
            data: {
                username: normalizedNewUsername || formerUser.username,
                email: newEmail || formerUser.email,
            },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });

        return res.status(200).json({ updatedUser });
    } catch (error: any) {
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
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
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
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
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
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
