import jwt from "jsonwebtoken";

export const generateRefreshToken = async (userId: number) => {
    const payload = { userId: userId.toString() };

    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "1y" });
};
