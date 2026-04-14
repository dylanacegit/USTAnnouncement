require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// GET announcements
app.get("/api/announcements", async (req, res) => {
  const db = await connectDB();

  const data = await db
    .collection("announcements")
    .find()
    .toArray();

  res.json(data);
});

// ADD announcement
app.post("/api/announcements", async (req, res) => {
  const db = await connectDB();

  const result = await db.collection("announcements").insertOne({
    ...req.body,
    createdAt: new Date(),
  });

  res.json(result);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});