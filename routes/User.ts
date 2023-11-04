import express, { Router } from "express";
import authToken from "../middlewares/verifyAuthToken";
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
    GetUserSchema,
} from "../schemas/User";

//* POST
router.post("/signup", validateSchema(SignUpSchema), userController.signup);
router.post("/login", validateSchema(LoginSchema), userController.login);
router.post("/refreshTokens", userController.refreshAccessToken);

//* GET
router.get("/:userId", [validateSchema(GetUserSchema), authToken, idValidation], userController.getUser);

//* PATCH
router.patch("/edit/username_email/:userId", [validateSchema(EditUsernameEmailSchema), authToken, idValidation], userController.editUsernameOrEmail);
router.patch("/edit/password/:userId", [validateSchema(EditUserPasswordSchema), authToken, idValidation], userController.editPassword);
router.patch("/edit/picture/:userId", [validateSchema(EditUserPictureSchema), authToken, idValidation], userController.editPicture);

//* DELETE
router.delete("/delete/:userId", [validateSchema(DeleteUserSchema), authToken, idValidation], userController.deleteUser);

export default router;
