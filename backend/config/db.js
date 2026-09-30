const dotenv = require("dotenv");

dotenv.config();

const mysql = require("mysql2");

const databaseUrl = process.env.DATABASE_URL;
const connectionConfig = databaseUrl
  ? (() => {
      const parsedUrl = new URL(databaseUrl);

      return {
        host: parsedUrl.hostname,
        port: parsedUrl.port ? Number(parsedUrl.port) : 3306,
        user: decodeURIComponent(parsedUrl.username),
        password: decodeURIComponent(parsedUrl.password),
        database: decodeURIComponent(parsedUrl.pathname.slice(1)),
      };
    })()
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const db = mysql.createPool(connectionConfig);

db.getConnection((err, connection) => {
  if (err) {
    console.log("MySQL connection failed:", err.message);
  } else {
    console.log("MySQL connected successfully");
    connection.release();
  }
});

module.exports = db;