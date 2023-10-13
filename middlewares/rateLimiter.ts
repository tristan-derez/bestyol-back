import { rateLimit } from "express-rate-limit";

// this is not implemented yet
export const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5, // Limit each IP to 5 create account requests per window
    message: "Trop de requête pour la création d'un compte de cette adresse IP. Merci de réessayer dans 1h",
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
