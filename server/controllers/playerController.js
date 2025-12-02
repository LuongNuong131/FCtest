import db from "../db/db.js";

// Helper: Ép kiểu số an toàn
const sanitizeInt = (val) => (isNaN(parseInt(val)) ? 0 : parseInt(val));

export const getAllPlayers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM players ORDER BY jersey_number ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPlayerById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM players WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Player not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPlayer = async (req, res) => {
  // ... (Giữ logic create cũ hoặc update tương tự updatePlayer bên dưới)
  // LuNu tự áp dụng logic sanitizeInt cho hàm này nhé
};

export const updatePlayer = async (req, res) => {
  const body = req.body;

  try {
    // 1. Xử lý Traits an toàn tuyệt đối
    let traitsJson;
    try {
      traitsJson =
        typeof body.traits === "object"
          ? JSON.stringify(body.traits)
          : body.traits || "[]";
    } catch (e) {
      traitsJson = "[]";
    }

    // 2. Xử lý ngày sinh
    const validDob = body.dob && body.dob !== "" ? body.dob : null;

    const updateData = [
      body.name,
      body.phone || "",
      validDob,
      sanitizeInt(body.height_cm),
      sanitizeInt(body.weight_kg),
      body.position,
      sanitizeInt(body.jerseyNumber),
      body.imageUrl || "",
      body.dominantFoot || "Right",
      sanitizeInt(body.pac),
      sanitizeInt(body.sho),
      sanitizeInt(body.pas),
      sanitizeInt(body.dri),
      sanitizeInt(body.def),
      sanitizeInt(body.phy),
      traitsJson,
      req.params.id,
    ];

    await db.query(
      `UPDATE players 
       SET name=?, phone=?, dob=?, height_cm=?, weight_kg=?, position=?, jersey_number=?, image_url=?, dominant_foot=?, 
       pac=?, sho=?, pas=?, dri=?, def=?, phy=?, traits_json=? 
       WHERE id=?`,
      updateData
    );

    // Đồng bộ tên hiển thị user
    await db.query("UPDATE users SET display_name=? WHERE player_id=?", [
      body.name,
      req.params.id,
    ]);

    res.json({ success: true, message: "Đã cập nhật hồ sơ cầu thủ! 🔥" });
  } catch (err) {
    console.error("Update Error:", err);
    res
      .status(500)
      .json({ success: false, error: "Lỗi Server: " + err.message });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    await db.query("DELETE FROM players WHERE id = ?", [req.params.id]);
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
