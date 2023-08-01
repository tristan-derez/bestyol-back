import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export default (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ erreur: "Accès non autorisé" });

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN as string) as JwtPayload & { userId: string };
        req.userId = decodedToken.userId;

        const requestedUserId: number = parseInt(req.params.userId, 10);
        if (parseInt(req.userId, 10) !== requestedUserId) {
            return res.status(403).json({ erreur: "Vous n'êtes pas autorisé à effectuer cette action" });
        }

        next();
    } catch (error) {
        res.status(401).json({ erreur: "Accès non autorisé" });
    }
};
