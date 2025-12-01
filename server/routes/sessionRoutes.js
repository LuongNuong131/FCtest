const express = require("express");
const router = express.Router();
const controller = require("../controllers/sessionController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// 1. Ai cũng xem được danh sách
router.get("/", verifyToken, controller.getAllSessions);

// 2. Cầu thủ tự điểm danh (Gọi hàm selfCheckIn)
router.post("/check-in", verifyToken, controller.selfCheckIn);

// --- ADMIN ROUTES ---
router.post("/", verifyToken, isAdmin, controller.createSession); // Tạo mới
router.delete("/:id", verifyToken, isAdmin, controller.deleteSession); // Xóa session

// Admin quản lý trạng thái (Đóng/Mở) - Lưu ý tên hàm là updateSessionStatus
router.put("/:id/status", verifyToken, isAdmin, controller.updateSessionStatus);

// Admin quản lý danh sách người tham gia
router.post("/admin/checkin", verifyToken, isAdmin, controller.adminCheckIn);
router.post(
  "/admin/remove",
  verifyToken,
  isAdmin,
  controller.adminRemoveCheckIn
);

module.exports = router;
