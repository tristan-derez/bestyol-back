import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/verifyAuthToken";

const router: Router = express.Router();

import successController from "../controllers/Success";
import validateSchema from "../middlewares/validateSchema";
import { GetSuccessByIdSchema } from "../schemas/Success";

//* GET
router.get("/", verifyAuthToken, successController.getAllSuccess);
router.get("/:successId", [validateSchema(GetSuccessByIdSchema), verifyAuthToken], successController.getOneSuccess);

export default router;
