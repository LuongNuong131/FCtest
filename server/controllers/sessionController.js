import db from "../config/db.js";
import VERIFY_ICONS from "../config/icons.js";

export const getAllSessions = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM sessions ORDER BY date DESC");
    const sessions = await Promise.all(
      rows.map(async (s) => {
        const [attendees] = await db.query(
          `SELECT p.id, p.name, p.image_url, p.jersey_number, p.position 
           FROM attendance a JOIN players p ON a.player_id = p.id WHERE a.session_id = ?`,
          [s.id]
        );
        return {
          ...s,
          attendees: attendees.map((a) => ({
            ...a,
            imageUrl: a.image_url,
            jerseyNumber: a.jersey_number,
          })),
        };
      })
    );
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createSession = async (req, res) => {
  const { date, note, secretIconId } = req.body;
  const id = "s" + Date.now().toString(36);
  try {
    await db.query(
      "INSERT INTO sessions (id, date, note, status, secret_icon_id) VALUES (?, ?, ?, 'OPEN', ?)",
      [id, date, note, secretIconId]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const selfCheckIn = async (req, res) => {
  const playerId = req.user.playerId;
  const { sessionId, selectedIconId } = req.body;

  if (!playerId)
    return res
      .status(400)
      .json({ message: "Tài khoản chưa liên kết cầu thủ!" });

  try {
    // 1. Check xem có bị block không
    const [attempts] = await db.query(
      "SELECT * FROM attendance_attempts WHERE session_id = ? AND player_id = ?",
      [sessionId, playerId]
    );
    if (attempts.length > 0 && attempts[0].blocked) {
      return res
        .status(403)
        .json({ message: "Bạn đã bị chặn do chọn sai mật mã!" });
    }

    // 2. Lấy thông tin session
    const [sessions] = await db.query(
      "SELECT secret_icon_id FROM sessions WHERE id = ?",
      [sessionId]
    );
    if (!sessions.length)
      return res.status(404).json({ message: "Buổi tập không tồn tại" });

    // 3. Kiểm tra mật mã (Icon)
    if (
      sessions[0].secret_icon_id &&
      selectedIconId !== sessions[0].secret_icon_id
    ) {
      // Sai mật mã -> Block luôn
      await db.query(
        `INSERT INTO attendance_attempts (session_id, player_id, attempt_count, blocked) 
         VALUES (?, ?, 1, TRUE) ON DUPLICATE KEY UPDATE blocked = TRUE`,
        [sessionId, playerId]
      );
      return res.status(403).json({ message: "SAI MẬT MÃ! Bạn đã bị chặn." });
    }

    // 4. Đúng mật mã -> Điểm danh
    await db.query(
      "INSERT IGNORE INTO attendance (session_id, player_id) VALUES (?, ?)",
      [sessionId, playerId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVerifyOptions = async (req, res) => {
  const { sessionId } = req.query;
  try {
    const [rows] = await db.query(
      "SELECT secret_icon_id FROM sessions WHERE id = ?",
      [sessionId]
    );
    if (!rows.length || !rows[0].secret_icon_id) return res.json([]);

    // Logic random 3 icon (1 đúng, 2 sai)
    const correct = VERIFY_ICONS.find((i) => i.id === rows[0].secret_icon_id);
    const wrongs = VERIFY_ICONS.filter((i) => i.id !== rows[0].secret_icon_id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    res.json([correct, ...wrongs].sort(() => 0.5 - Math.random()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Admin Functions
export const adminCheckIn = async (req, res) => {
  await db.query(
    "INSERT IGNORE INTO attendance (session_id, player_id) VALUES (?, ?)",
    [req.body.sessionId, req.body.playerId]
  );
  res.json({ success: true });
};

export const adminRemoveCheckIn = async (req, res) => {
  await db.query(
    "DELETE FROM attendance WHERE session_id = ? AND player_id = ?",
    [req.body.sessionId, req.body.playerId]
  );
  res.json({ success: true });
};

export const deleteSession = async (req, res) => {
  await db.query("DELETE FROM sessions WHERE id = ?", [req.params.id]);
  res.json({ success: true });
};

export const updateSessionStatus = async (req, res) => {
  await db.query("UPDATE sessions SET status = ? WHERE id = ?", [
    req.body.status,
    req.params.id,
  ]);
  res.json({ success: true });
};
