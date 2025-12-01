const db = require("../config/db");

// Helper: Format ngày chuẩn YYYY-MM-DD không bị lệch múi giờ
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-CA");
};

// Helper: Map DB fields to Frontend fields
const mapPlayer = (p) => ({
  ...p,
  jerseyNumber: p.jersey_number,
  imageUrl: p.image_url,
  totalAttendance: p.total_attendance,
  dob: formatDate(p.dob),
  // FIX: Mapping dominant_foot (DB) -> dominantFoot (Front)
  dominantFoot: p.dominant_foot,
  // 6 chỉ số mới (DB và Front đều là pac, sho,...)
  pac: p.pac,
  sho: p.sho,
  pas: p.pas,
  dri: p.dri,
  def: p.def,
  phy: p.phy,
});

exports.getAllPlayers = async (req, res) => {
  try {
    const query = `
      SELECT p.*, 
      (SELECT COUNT(*) FROM attendance a WHERE a.player_id = p.id) as total_attendance 
      FROM players p 
      ORDER BY p.name ASC
    `;
    const [rows] = await db.query(query);
    res.json(rows.map(mapPlayer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlayerById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, 
      (SELECT COUNT(*) FROM attendance a WHERE a.player_id = p.id) as total_attendance 
      FROM players p WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Player not found" });
    res.json(mapPlayer(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPlayer = async (req, res) => {
  const {
    name,
    position,
    jerseyNumber,
    imageUrl,
    phone,
    dob,
    height_cm,
    weight_kg,
    dominantFoot,
    pac,
    sho,
    pas,
    dri,
    def,
    phy,
  } = req.body;
  try {
    const [last] = await db.query("SELECT MAX(id) as maxId FROM players");
    const newId = (last[0].maxId || 0) + 1;

    await db.query(
      `INSERT INTO players (id, name, position, jersey_number, image_url, phone, dob, height_cm, weight_kg, dominant_foot, pac, sho, pas, dri, def, phy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        name,
        position,
        jerseyNumber,
        imageUrl,
        phone,
        dob,
        height_cm,
        weight_kg,
        dominantFoot,
        pac,
        sho,
        pas,
        dri,
        def,
        phy,
      ]
    );
    res.status(201).json({ message: "Thêm thành công", id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePlayer = async (req, res) => {
  const {
    name,
    phone,
    dob,
    height_cm,
    weight_kg,
    position,
    jerseyNumber,
    imageUrl,
    dominantFoot,
    pac,
    sho,
    pas,
    dri,
    def,
    phy,
  } = req.body;
  try {
    await db.query(
      `UPDATE players 
       SET name=?, phone=?, dob=?, height_cm=?, weight_kg=?, position=?, jersey_number=?, image_url=?, dominant_foot=?, 
       pac=?, sho=?, pas=?, dri=?, def=?, phy=? 
       WHERE id=?`,
      [
        name,
        phone,
        dob,
        height_cm,
        weight_kg,
        position,
        jerseyNumber,
        imageUrl,
        dominantFoot,
        pac,
        sho,
        pas,
        dri,
        def,
        phy,
        req.params.id,
      ]
    );
    await db.query("UPDATE users SET display_name=? WHERE player_id=?", [
      name,
      req.params.id,
    ]);

    res.json({ message: "Cập nhật thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePlayer = async (req, res) => {
  try {
    await db.query("DELETE FROM players WHERE id=?", [req.params.id]);
    res.json({ message: "Đã xóa cầu thủ thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
