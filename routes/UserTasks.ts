import express, { Router } from "express";
import authToken from "../middlewares/authToken";

const router: Router = express.Router();

import userTasksController from "../controllers/UserTasks";
import idValidation from "../middlewares/idValidation";

//* POST
router.post("/:userId", [authToken, idValidation], userTasksController.createUserCustomTask);
router.post("/daily/:userId", [authToken, idValidation], userTasksController.createUserDailyTasks);

//* GET
router.get("/:userId", [authToken, idValidation], userTasksController.getUserTasks);

//* PATCH
router.patch("/:taskId", authToken, userTasksController.changeTitleCustomTask);
router.patch("/daily/:userTaskId", authToken, userTasksController.validateDailyTask);
router.patch("/custom/:userTaskId", authToken, userTasksController.validateCustomTask);

//* DELETE
router.delete("/:taskId", authToken, userTasksController.deleteCustomTask);

export default router;
