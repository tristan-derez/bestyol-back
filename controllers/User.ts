import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

import { AuthenticatedRequest } from "../middlewares/idValidation";

import { Users, prisma } from "../services/prismaClient";
import { generateAccessToken } from "../utils/auth/generateAccessToken";
import logger from "../utils/logger";

//* POST
export const signup = async (req: Request, res: Response, next: NextFunction) => {
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
        logger.info("This is an info log message.");

        return res.status(201).json({
            user: createdUser,
            accessToken: accessToken,
        });
    } catch (error: any) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
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
        next(error);
    }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) throw new Error("Authorization absent des headers");
        const token = req.headers.authorization.split(" ")[1];

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
        next(error);
    }
};

//* GET
export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.userId);

    try {
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
        next(error);
    }
};

//* PATCH
export const editUsernameOrEmail = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.userId);
    const { username, email }: { username: string; email: string } = req.body;
    const errors = [];

    const normalizedNewUsername: string = username.toLowerCase();
    const newEmail: string = email;

    try {
        const formerUser = await prisma.users.findUnique({ where: { id: userId } });

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
                errors.push({ message: "Ce nom d'utilisateur n'est pas disponible" });
            }
        }

        // Check if the new email is taken by another user
        if (newEmail !== formerUser.email) {
            const existingUserWithNewEmail = await prisma.users.findUnique({
                where: { email: newEmail },
            });

            if (existingUserWithNewEmail) {
                errors.push({ message: "Cette adresse email n'est pas disponible" });
            }
        }

        if (errors.length > 0) {
            throw Object.assign(new Error(), {
                status: 400,
                errors: errors,
            });
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
        next(error);
    }
};

export const editPassword = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.userId);
    const { formerPassword, newPassword }: { formerPassword: string; newPassword: string } = req.body;

    try {
        const user = await prisma.users.findUnique({ where: { id: userId } });

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
                    id: userId,
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
        next(error);
    }
};

export const editPicture = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.userId);
    const pictureNumber: number = req.body.pictureNumber;

    try {
        const newPicture = `/assets/avatars/Icon${pictureNumber}.png`;

        const updatedUser = await prisma.users.update({
            where: {
                id: userId,
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
        next(error);
    }
};

//* DELETE
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.userId);
    const { password }: { password: string } = req.body;

    try {
        const user = await prisma.users.findUnique({ where: { id: userId } });

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
                        userId: userId,
                    },
                }),
                prisma.userTasks.deleteMany({
                    where: {
                        userId: userId,
                    },
                }),
                prisma.yol.deleteMany({
                    where: {
                        userId: userId,
                    },
                }),
                prisma.users.delete({
                    where: {
                        id: userId,
                    },
                }),
            ]);

            return res.status(204).send();
        }
    } catch (error: any) {
        next(error);
    }
};

export default {
    signup,
    login,
    refreshAccessToken,
    getUserById,
    editUsernameOrEmail,
    editPassword,
    editPicture,
    deleteUser,
};
