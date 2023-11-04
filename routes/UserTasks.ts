import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/verifyAuthToken";

const router: Router = express.Router();

import userTasksController from "../controllers/UserTasks";
import idValidation from "../middlewares/idValidation";

//* POST
router.post("/:userId", [verifyAuthToken, idValidation], userTasksController.createUserCustomTask);
router.post("/daily/:userId", [verifyAuthToken, idValidation], userTasksController.createUserDailyTasks);

//* GET
router.get("/:userId", [verifyAuthToken, idValidation], userTasksController.getUserTasks);

//* PATCH
router.patch("/:taskId", verifyAuthToken, userTasksController.changeTitleCustomTask);
router.patch("/daily/:userTaskId", verifyAuthToken, userTasksController.validateDailyTask);
router.patch("/custom/:userTaskId", verifyAuthToken, userTasksController.validateCustomTask);

//* DELETE
router.delete("/:taskId", verifyAuthToken, userTasksController.deleteCustomTask);

export default router;
