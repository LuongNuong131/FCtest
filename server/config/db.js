const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  // Dùng env variable, fallback về localhost cho dev nếu cần
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root123",
  database: process.env.DB_NAME || "football_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Cấu hình SSL cho môi trường Production (Aiven/Vercel)
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : null,
});

module.exports = pool.promise();
