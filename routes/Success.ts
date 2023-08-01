import express, { Router } from "express";
import authToken from "../middlewares/authToken";

const router: Router = express.Router();

import successController from "../controllers/Success";

//* GET
router.get("/", authToken, successController.getAllSuccess);
router.get("/:id", authToken, successController.getOneSuccess);

export default router;
