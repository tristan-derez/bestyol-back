import express, { Express, NextFunction, Request, Response } from "express";

// routes import
import userRoutes from "./routes/User";
import successRoutes from "./routes/Success";
import userSuccessRoutes from "./routes/UserSuccess";
import userTasks from "./routes/UserTasks";
import yolRoutes from "./routes/Yol";
import speciesRoutes from "./routes/Species";
import logger from "./utils/logger";

const app: Express = express();

app.use(express.json());

const allowedOrigin: string = process.env.CORS_ALLOWED_ORIGIN as string;

// cors middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});

app.use("/api/user", userRoutes);
app.use("/api/success", successRoutes);
app.use("/api/user-success", userSuccessRoutes);
app.use("/api/user-tasks", userTasks);
app.use("/api/yol", yolRoutes);
app.use("/api/species", speciesRoutes);

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = error.status || 500;
    let errorResponse;

    if (Array.isArray(error.errors)) {
        errorResponse = { erreurs: error.errors };
        logger.error(error.errors);
    } else if (error.message) {
        logger.error(error.message);
        errorResponse = { erreur: error.message };
    } else {
        logger.error("Une erreur est survenue");
        errorResponse = { message: "Une erreur est survenue" };
    }

    res.status(statusCode).json(errorResponse);
});

export default app;
