import jwt from "jsonwebtoken";

export const generateAccessToken = async (userId: number) => {
    const payload = { userId: userId.toString() };

    return jwt.sign(payload, process.env.JWT_TOKEN as string, { expiresIn: "30d" });
};
