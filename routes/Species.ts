import express, { Router } from "express";

const router: Router = express.Router();

import speciesController from "../controllers/Species";

//* GET
router.get("/", speciesController.getAllSpecies);

export default router;
