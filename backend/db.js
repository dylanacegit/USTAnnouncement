const { MongoClient } = require("mongodb");
const dns = require("dns");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in .env");
}

if (uri.startsWith("mongodb+srv://")) {
  const dnsServers = (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
  }
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
});

let db;

async function connectDB() {
  if (db) return db;

  await client.connect();

  db = client.db(process.env.DB_NAME || "ustEventsDB");
  console.log("MongoDB Connected");
  return db;
}

module.exports = connectDB;
