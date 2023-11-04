import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/verifyAuthToken";
import idValidation from "../middlewares/idValidation";
import validateSchema from "../middlewares/validateSchema";

const router: Router = express.Router();

import userController from "../controllers/User";
import {
    SignUpSchema,
    LoginSchema,
    EditUsernameEmailSchema,
    EditUserPasswordSchema,
    EditUserPictureSchema,
    DeleteUserSchema,
    GetUserByIdSchema,
} from "../schemas/User";

//* POST
router.post("/signup", validateSchema(SignUpSchema), userController.signup);
router.post("/login", validateSchema(LoginSchema), userController.login);
router.post("/refreshTokens", userController.refreshAccessToken);

//* GET
router.get("/:userId", [validateSchema(GetUserByIdSchema), verifyAuthToken, idValidation], userController.getUserById);

//* PATCH
router.patch(
    "/edit/username_email/:userId",
    [validateSchema(EditUsernameEmailSchema), verifyAuthToken, idValidation],
    userController.editUsernameOrEmail
);
router.patch("/edit/password/:userId", [validateSchema(EditUserPasswordSchema), verifyAuthToken, idValidation], userController.editPassword);
router.patch("/edit/picture/:userId", [validateSchema(EditUserPictureSchema), verifyAuthToken, idValidation], userController.editPicture);

//* DELETE
router.delete("/delete/:userId", [validateSchema(DeleteUserSchema), verifyAuthToken, idValidation], userController.deleteUser);

export default router;
