import db from "../config/db.js";

const sanitizeInt = (val) => (isNaN(parseInt(val)) ? 0 : parseInt(val));

export const getAllPlayers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM players ORDER BY jersey_number ASC"
    );
    // MAP DỮ LIỆU DB -> FRONTEND
    const players = await Promise.all(
      rows.map(async (p) => {
        const [att] = await db.query(
          "SELECT COUNT(*) as total FROM attendance WHERE player_id = ?",
          [p.id]
        );
        return {
          ...p,
          jerseyNumber: p.jersey_number, // Map snake_case -> camelCase
          imageUrl: p.image_url, // Map snake_case -> camelCase
          dominantFoot: p.dominant_foot,
          traits: p.traits_json, // Trả về JSON traits
          totalAttendance: att[0].total,
        };
      })
    );
    res.json(players);
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
      return res.status(404).json({ message: "Not found" });

    const p = rows[0];
    const [att] = await db.query(
      "SELECT COUNT(*) as total FROM attendance WHERE player_id = ?",
      [p.id]
    );

    res.json({
      ...p,
      jerseyNumber: p.jersey_number,
      imageUrl: p.image_url,
      dominantFoot: p.dominant_foot,
      traits: p.traits_json,
      totalAttendance: att[0].total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPlayer = async (req, res) => {
  const body = req.body;
  try {
    // Xử lý traits: đảm bảo là string JSON hợp lệ
    let traitsJson = null;
    if (body.traits) {
      traitsJson =
        typeof body.traits === "string"
          ? body.traits
          : JSON.stringify(body.traits);
    }

    const [result] = await db.query(
      `INSERT INTO players 
      (name, phone, dob, height_cm, weight_kg, position, jersey_number, image_url, dominant_foot, pac, sho, pas, dri, def, phy, traits_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.phone,
        body.dob || null,
        sanitizeInt(body.height_cm),
        sanitizeInt(body.weight_kg),
        body.position,
        sanitizeInt(body.jerseyNumber), // Nhận camelCase từ Frontend
        body.imageUrl,
        body.dominantFoot || "Right",
        sanitizeInt(body.pac),
        sanitizeInt(body.sho),
        sanitizeInt(body.pas),
        sanitizeInt(body.dri),
        sanitizeInt(body.def),
        sanitizeInt(body.phy),
        traitsJson,
      ]
    );
    res.json({ success: true, message: "Created", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updatePlayer = async (req, res) => {
  const body = req.body;
  try {
    let traitsJson = null;
    if (body.traits) {
      traitsJson =
        typeof body.traits === "string"
          ? body.traits
          : JSON.stringify(body.traits);
    }

    await db.query(
      `UPDATE players SET 
            name=?, phone=?, dob=?, height_cm=?, weight_kg=?, position=?, 
            jersey_number=?, image_url=?, dominant_foot=?, 
            pac=?, sho=?, pas=?, dri=?, def=?, phy=?, traits_json=? 
            WHERE id=?`,
      [
        body.name,
        body.phone,
        body.dob || null,
        sanitizeInt(body.height_cm),
        sanitizeInt(body.weight_kg),
        body.position,
        sanitizeInt(body.jerseyNumber),
        body.imageUrl,
        body.dominantFoot,
        sanitizeInt(body.pac),
        sanitizeInt(body.sho),
        sanitizeInt(body.pas),
        sanitizeInt(body.dri),
        sanitizeInt(body.def),
        sanitizeInt(body.phy),
        traitsJson,
        req.params.id,
      ]
    );

    // Cập nhật luôn tên hiển thị user nếu có liên kết
    await db.query("UPDATE users SET display_name=? WHERE player_id=?", [
      body.name,
      req.params.id,
    ]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    await db.query("DELETE FROM players WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
