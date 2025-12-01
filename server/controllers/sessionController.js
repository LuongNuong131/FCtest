const db = require("../config/db");

// 1. Lấy danh sách buổi tập
exports.getAllSessions = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM sessions ORDER BY date DESC");

    // Lấy danh sách người tham gia cho từng session
    const sessions = await Promise.all(
      rows.map(async (session) => {
        const [attendees] = await db.query(
          `SELECT p.id, p.name, p.image_url, p.jersey_number, p.position 
         FROM attendance a 
         JOIN players p ON a.player_id = p.id 
         WHERE a.session_id = ?`,
          [session.id]
        );
        return { ...session, attendees };
      })
    );

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Tạo buổi tập (Admin)
exports.createSession = async (req, res) => {
  const { date, note } = req.body;
  const id = "s" + Date.now().toString(36); // ID ngắn gọn
  try {
    await db.query(
      "INSERT INTO sessions (id, date, note, status) VALUES (?, ?, ?, 'OPEN')",
      [id, date, note]
    );
    res.json({ message: "Tạo buổi tập thành công", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. User tự điểm danh (SỬA LỖI: Hàm này phải có để route không bị lỗi undefined)
exports.selfCheckIn = async (req, res) => {
  // Lấy playerId từ token (req.user do middleware verifyToken giải mã)
  const playerId = req.user.playerId;

  if (!playerId) {
    return res
      .status(400)
      .json({ message: "Không tìm thấy thông tin cầu thủ của bạn." });
  }

  const { sessionId } = req.body;

  try {
    // Kiểm tra session có đang mở không
    const [sessions] = await db.query(
      "SELECT status FROM sessions WHERE id = ?",
      [sessionId]
    );
    if (sessions.length === 0)
      return res.status(404).json({ message: "Không tìm thấy buổi tập" });

    if (sessions[0].status !== "OPEN") {
      return res.status(400).json({ message: "Buổi tập này đã khóa sổ!" });
    }

    // Insert Ignore để không lỗi nếu đã điểm danh rồi
    await db.query(
      "INSERT IGNORE INTO attendance (session_id, player_id) VALUES (?, ?)",
      [sessionId, playerId]
    );
    res.json({ success: true, message: "Điểm danh thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- CÁC HÀM CHO ADMIN ---

// 4. Admin điểm danh hộ
exports.adminCheckIn = async (req, res) => {
  const { sessionId, playerId } = req.body;
  try {
    await db.query(
      "INSERT IGNORE INTO attendance (session_id, player_id) VALUES (?, ?)",
      [sessionId, playerId]
    );
    res.json({ success: true, message: "Đã thêm cầu thủ vào danh sách" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Admin xóa lượt điểm danh
exports.adminRemoveCheckIn = async (req, res) => {
  const { sessionId, playerId } = req.body;
  try {
    await db.query(
      "DELETE FROM attendance WHERE session_id = ? AND player_id = ?",
      [sessionId, playerId]
    );
    res.json({ success: true, message: "Đã xóa cầu thủ khỏi danh sách" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Xóa buổi tập
exports.deleteSession = async (req, res) => {
  try {
    await db.query("DELETE FROM sessions WHERE id = ?", [req.params.id]);
    res.json({ message: "Đã xóa buổi tập" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Cập nhật trạng thái (Đóng/Mở)
exports.updateSessionStatus = async (req, res) => {
  const { status } = req.body; // 'OPEN' hoặc 'CLOSED'
  try {
    await db.query("UPDATE sessions SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
