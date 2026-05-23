const mongoose = require('mongoose');
const { initDb } = require('../utils/dbEngine');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (mongoURI) {
    try {
      const conn = await mongoose.connect(mongoURI);
      console.log(`\x1b[32m%s\x1b[0m`, `✔ MongoDB Connected Successfully: ${conn.connection.host}`);
      return true;
    } catch (error) {
      console.error(`\x1b[31m%s\x1b[0m`, `✖ MongoDB Connection Failed: ${error.message}`);
      console.log(`\x1b[33m%s\x1b[0m`, `⚠ Falling back to Local JSON Database Engine...`);
      process.env.MONGODB_URI = ''; // Clear URI so models load local fallback
      initDb();
      console.log(`\x1b[32m%s\x1b[0m`, `✔ Local JSON Database Engine Active: server/data/db.json`);
      return false;
    }
  } else {
    initDb();
    console.log(`\x1b[36m%s\x1b[0m`, `✦ Running in offline mode: Local JSON Database Engine Active`);
    console.log(`\x1b[32m%s\x1b[0m`, `✔ Local File Storage: server/data/db.json`);
    return false;
  }
};

module.exports = connectDB;
