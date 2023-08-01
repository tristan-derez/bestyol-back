import express, { Router } from "express";
import authToken from "../middlewares/authToken";
import yolController from "../controllers/Yol";

const router: Router = express.Router();

//* POST
router.post("/create", authToken, yolController.createYol);

//* GET
router.get("/:yolId", authToken, yolController.getOneYol);
router.get("/user/:userId", authToken, yolController.getOneYolByUserId);

//* PATCH
router.patch("/evolve/:yolId", authToken, yolController.evolve);

export default router;
