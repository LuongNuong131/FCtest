import express from "express";
const router = express.Router();
import * as controller from "../controllers/fundController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

// Ai cũng xem được
router.get("/", verifyToken, controller.getAllFunds);

// Chỉ Admin được tạo và xóa
router.post("/", verifyToken, isAdmin, controller.createFund);
router.delete("/:id", verifyToken, isAdmin, controller.deleteFund);

export default router;
