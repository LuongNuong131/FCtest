import express from "express";
const router = express.Router();
import * as controller from "../controllers/playerController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

router.get("/", verifyToken, controller.getAllPlayers);
router.get("/:id", verifyToken, controller.getPlayerById);

// Admin Only
router.post("/", verifyToken, isAdmin, controller.createPlayer);
router.put("/:id", verifyToken, isAdmin, controller.updatePlayer);
router.delete("/:id", verifyToken, isAdmin, controller.deletePlayer);

export default router;
