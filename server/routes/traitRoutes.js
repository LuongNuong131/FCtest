import express from "express";
const router = express.Router();
import * as controller from "../controllers/traitController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

router.get("/", verifyToken, controller.getCustomTraits);
router.post("/", verifyToken, isAdmin, controller.createCustomTrait);

export default router;
