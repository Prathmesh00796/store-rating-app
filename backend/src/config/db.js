const mysql = require('mysql2/promise');
const { sqliteQuery } = require('./sqliteDb');

const poolConfig = {
  waitForConnections: true,
  connectionLimit: 10,
};

const hasRemoteDb = Boolean(
  process.env.DATABASE_URL || 
  process.env.MYSQL_URL || 
  (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1')
);

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

let mysqlPool = null;
let useSqliteFallback = false;

// Only create MySQL pool if not explicitly running on sqlite
try {
  mysqlPool = mysql.createPool(poolConfig);
} catch (err) {
  console.warn('[DB] Could not create MySQL pool, using embedded SQLite:', err.message);
  useSqliteFallback = true;
}

const db = {
  get isSqlite() {
    return useSqliteFallback;
  },
  async query(sql, params) {
    if (useSqliteFallback || !mysqlPool) {
      return sqliteQuery(sql, params);
    }

    try {
      return await mysqlPool.query(sql, params);
    } catch (err) {
      // If MySQL fails with connection error (e.g. ECONNREFUSED on Render when no local MySQL exists)
      const isConnError = [
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT',
        'EHOSTUNREACH',
        'PROTOCOL_CONNECTION_LOST',
        'ER_ACCESS_DENIED_ERROR',
        'ER_BAD_DB_ERROR'
      ].includes(err.code);

      if (isConnError) {
        console.warn(`[DB] MySQL connection failed (${err.code}). Automatically switching to embedded SQLite engine.`);
        useSqliteFallback = true;
        return sqliteQuery(sql, params);
      }

      throw err;
    }
  }
};

module.exports = db;
