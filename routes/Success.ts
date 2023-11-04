import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/verifyAuthToken";

const router: Router = express.Router();

import successController from "../controllers/Success";

//* GET
router.get("/", verifyAuthToken, successController.getAllSuccess);
router.get("/:id", verifyAuthToken, successController.getOneSuccess);

export default router;
