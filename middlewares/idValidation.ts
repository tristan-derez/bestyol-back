import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export default (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Accès non autorisé" });

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN as string) as JwtPayload & { userId: string };
        req.userId = decodedToken.userId;

        if (req.params.userId) {
            const requestedUserId: number = parseInt(req.params.userId, 10);
            if (parseInt(req.userId, 10) !== requestedUserId) {
                throw Object.assign(new Error(), {
                    status: 403,
                    message: "Accès non autorisé",
                });
            }
        } else if (req.body.userId) {
            const requestedUserId: number = parseInt(req.body.userId, 10);
            if (parseInt(req.userId, 10) !== requestedUserId) {
                throw Object.assign(new Error(), {
                    status: 403,
                    message: "Accès non autorisé",
                });
            }
        } else {
            throw Object.assign(new Error(), {
                status: 400,
                message: "userId non spécifié",
            });
        }

        next();
    } catch (error: any) {
        next(error);
    }
};
