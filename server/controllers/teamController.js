import db from "../config/db.js";

export const getTeamsWithMembers = async (req, res) => {
  try {
    // Lấy thông tin đội + đội trưởng
    const [teams] = await db.query(`
      SELECT t.*, p.name as captain_name, p.image_url as captain_image 
      FROM teams t 
      LEFT JOIN players p ON t.captain_id = p.id
    `);

    // Lấy danh sách thành viên
    const [members] = await db.query(`
      SELECT tm.team_id, p.* FROM team_members tm
      JOIN players p ON tm.player_id = p.id
      ORDER BY p.jersey_number ASC
    `);

    // Gộp dữ liệu & Tính điểm
    const result = teams.map((team) => {
      const teamMembers = members
        .filter((m) => m.team_id === team.id)
        .map((m) => ({
          ...m,
          jerseyNumber: m.jersey_number, // Map field
          imageUrl: m.image_url,
        }));

      // Tính tổng OVR của đội
      const totalStrength = teamMembers.reduce((sum, p) => {
        const stats = [p.pac, p.sho, p.pas, p.dri, p.def, p.phy].map(
          (v) => Number(v) || 50
        );
        const ovr = Math.round(stats.reduce((a, b) => a + b, 0) / 6);
        return sum + ovr;
      }, 0);

      return {
        ...team,
        members: teamMembers,
        memberCount: teamMembers.length,
        totalStrength,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Lỗi lấy team:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

export const updateTeamMembers = async (req, res) => {
  const { teamSplits } = req.body;
  // format: { "t1": [1, 2], "t2": [3, 4] }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Xóa sạch thành viên cũ
    await connection.query("DELETE FROM team_members");

    // Thêm thành viên mới theo danh sách chia đội
    for (const [teamId, playerIds] of Object.entries(teamSplits)) {
      if (playerIds && playerIds.length > 0) {
        const values = playerIds.map((pid) => [teamId, pid]);
        await connection.query(
          "INSERT INTO team_members (team_id, player_id) VALUES ?",
          [values]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: "Đội hình đã được lưu!" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};
