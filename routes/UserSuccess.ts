import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/verifyAuthToken";

const router: Router = express.Router();

import userSuccessController from "../controllers/UserSuccess";
import idValidation from "../middlewares/idValidation";

//* GET
router.get("/:userId", [verifyAuthToken, idValidation], userSuccessController.getAllUserSuccessByUserId);

//* PATCH
router.patch("/validate/:id", verifyAuthToken, userSuccessController.validateSuccess);

export default router;
