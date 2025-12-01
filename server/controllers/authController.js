const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "fcdbb_secret_key_super_secure";

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query(
      `SELECT u.*, p.image_url as avatar, p.name as player_name 
       FROM users u 
       LEFT JOIN players p ON u.player_id = p.id 
       WHERE u.username = ?`,
      [username]
    );

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Tài khoản không tồn tại!" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Sai mật khẩu!" });
    }

    // Tạo token
    const token = jwt.sign(
      { id: user.id, role: user.role, playerId: user.player_id },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name || user.player_name,
        role: user.role,
        playerId: user.player_id,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hàm tạo user admin mặc định (chạy 1 lần)
exports.seedAdmins = async () => {
  // Logic seed đã có trong file database.txt,
  // hàm này có thể dùng để check hoặc tạo thêm nếu cần
};
