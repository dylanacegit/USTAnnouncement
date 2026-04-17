const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in .env");
}

console.log("DB file loaded");
console.log("MONGODB_URI loaded:", !!uri);
console.log("DB_NAME loaded:", process.env.DB_NAME);

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
});

let db;

async function connectDB() {
  if (db) return db;

  console.log("Connecting to MongoDB...");
  await client.connect();
  console.log("MongoDB client connected");

  db = client.db(process.env.DB_NAME || "ustEventsDB");
  console.log("MongoDB Connected");
  return db;
}

module.exports = connectDB;