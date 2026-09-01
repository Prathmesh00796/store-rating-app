require('dotenv').config();

const app = require('./app');
const db = require('./config/db');
const initDb = require('./config/initDb');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await initDb(db);
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
});
