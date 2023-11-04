import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/verifyAuthToken";

const router: Router = express.Router();

import userTasksController, { deleteCustomTask } from "../controllers/UserTasks";
import idValidation from "../middlewares/idValidation";
import validateSchema from "../middlewares/validateSchema";
import {
    CreateUserCustomTaskSchema,
    CreateUserDailyTasksSchema,
    DeleteCustomTaskSchema,
    GetUserTasksSchema,
    UpdateCustomTaskSchema,
    ValidateCustomTaskSchema,
    ValidateDailyTaskSchema,
} from "../schemas/UserTask";

//* POST
router.post("/:userId", [validateSchema(CreateUserCustomTaskSchema), verifyAuthToken, idValidation], userTasksController.createUserCustomTask);
router.post("/daily/:userId", [validateSchema(CreateUserDailyTasksSchema), verifyAuthToken, idValidation], userTasksController.createUserDailyTasks);

//* GET
router.get("/:userId", [validateSchema(GetUserTasksSchema), verifyAuthToken, idValidation], userTasksController.getUserTasks);

//* PATCH
router.patch("/:taskId", [validateSchema(UpdateCustomTaskSchema), verifyAuthToken], userTasksController.changeTitleCustomTask);
router.patch("/daily/:userTaskId", [validateSchema(ValidateDailyTaskSchema), verifyAuthToken], userTasksController.validateDailyTask);
router.patch("/custom/:userTaskId", [validateSchema(ValidateCustomTaskSchema), verifyAuthToken], userTasksController.validateCustomTask);

//* DELETE
router.delete("/:taskId", [validateSchema(DeleteCustomTaskSchema), verifyAuthToken], userTasksController.deleteCustomTask);

export default router;
