import express from "express";
const router = express.Router();
import * as controller from "../controllers/teamController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

// Sửa controller.getAllTeams -> controller.getTeamsWithMembers
router.get("/", verifyToken, controller.getTeamsWithMembers);

// Route cập nhật thành viên (Admin)
router.post("/members", verifyToken, isAdmin, controller.updateTeamMembers); // Lưu ý: Hàm này cần có trong controller nếu bạn dùng tính năng chia lại đội

export default router;
