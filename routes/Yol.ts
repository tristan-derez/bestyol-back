import express, { Router } from "express";
import authToken from "../middlewares/verifyAuthToken";
import yolController from "../controllers/Yol";
import validateSchema from "../middlewares/validateSchema";
import { nameYolSchema } from "../schemas/Yol";

const router: Router = express.Router();

//* POST
router.post("/create", [authToken, validateSchema(nameYolSchema)], yolController.createYol);

//* GET
router.get("/:yolId", authToken, yolController.getOneYol);
router.get("/user/:userId", authToken, yolController.getOneYolByUserId);

//* PATCH
router.patch("/evolve/:yolId", authToken, yolController.evolve);

export default router;
