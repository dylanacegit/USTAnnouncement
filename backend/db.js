const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in .env");
}

const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (db) return db;

  await client.connect();
  db = client.db(process.env.DB_NAME || "ustEventsDB");
  console.log("MongoDB Connected");
  return db;
}

module.exports = connectDB;