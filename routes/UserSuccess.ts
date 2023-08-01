import express, { Router } from "express";
import authToken from "../middlewares/authToken";

const router: Router = express.Router();

import userSuccessController from "../controllers/UserSuccess";
import idValidation from "../middlewares/idValidation";

//* GET
router.get("/:userId", [authToken, idValidation], userSuccessController.getAllUserSuccessByUserId);

//* PATCH
router.patch("/validate/:id", authToken, userSuccessController.validateSuccess);

export default router;
