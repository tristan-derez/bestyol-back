import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/verifyAuthToken";
import yolController from "../controllers/Yol";
import validateSchema from "../middlewares/validateSchema";
import { CreateYolSchema, EvolveYolSchema, GetOneYolByUserIdSchema, GetOneYolSchema } from "../schemas/Yol";
import idValidation from "../middlewares/idValidation";

const router: Router = express.Router();

//* POST
router.post("/create", [validateSchema(CreateYolSchema), verifyAuthToken, idValidation], yolController.createYol);

//* GET
router.get("/:yolId", [validateSchema(GetOneYolSchema), verifyAuthToken], yolController.getOneYol);
router.get("/user/:userId", [validateSchema(GetOneYolByUserIdSchema), verifyAuthToken], yolController.getOneYolByUserId);

//* PATCH
router.patch("/evolve/:yolId", [validateSchema(EvolveYolSchema), verifyAuthToken], yolController.evolveYol);

export default router;
