const mysql = require('mysql2/promise');

const poolConfig = {
  waitForConnections: true,
  connectionLimit: 10,
};

if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
  poolConfig.uri = process.env.DATABASE_URL || process.env.MYSQL_URL;
} else {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.port = parseInt(process.env.DB_PORT) || 3306;
  poolConfig.user = process.env.DB_USER || 'root';
  poolConfig.password = process.env.DB_PASSWORD || '';
  poolConfig.database = process.env.DB_NAME || 'store_rating';
}

// Cloud MySQL databases often require SSL
if (process.env.DB_SSL === 'true' || (poolConfig.uri && !poolConfig.uri.includes('localhost'))) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
