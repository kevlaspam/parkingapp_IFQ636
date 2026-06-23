// config/db.js
const mongoose = require("mongoose");

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = null;
    Database.instance = this;
  }

  async connect() {
    if (this.connection) {
      return this.connection;
    }
    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected successfully (Singleton Instance)");
      return this.connection;
    } catch (error) {
      console.error("MongoDB connection error:", error.message);
      process.exit(1);
    }
  }
}

const dbInstance = new Database();
module.exports = () => dbInstance.connect();
