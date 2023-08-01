import express, { Express, NextFunction, Request, Response } from "express";

// routes import
import userRoutes from "./routes/User";
import successRoutes from "./routes/Success";
import userSuccessRoutes from "./routes/UserSuccess";
import userTasks from "./routes/UserTasks";
import yolRoutes from "./routes/Yol";
import speciesRoutes from "./routes/Species";

// call express method to create express app
const app: Express = express();

// use express json method to translate json from client 🙃
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors middleware
// could be app.use(cors()) if needed 🤓
app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
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

export default app;
