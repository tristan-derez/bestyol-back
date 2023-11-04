import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/verifyAuthToken";

const router: Router = express.Router();

import userSuccessController from "../controllers/UserSuccess";
import idValidation from "../middlewares/idValidation";
import validateSchema from "../middlewares/validateSchema";
import { GetAllUserSuccessByUserIdSchema, ValidateUserSuccessSchema } from "../schemas/UserSuccess";

//* GET
router.get(
    "/:userId",
    [validateSchema(GetAllUserSuccessByUserIdSchema), verifyAuthToken, idValidation],
    userSuccessController.getAllUserSuccessByUserId
);

//* PATCH
router.patch("/validate/:userSuccessId", [validateSchema(ValidateUserSuccessSchema), verifyAuthToken], userSuccessController.validateSuccess);

export default router;
