require("dotenv").config();

const app = require("./app");
const { ensureSeedAdmin } = require("./services/auth.service");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  ensureSeedAdmin()
    .then((admin) => {
      if (admin) console.log(`Admin account ready: ${admin.email}`);
    })
    .catch((error) => {
      console.error("Failed to prepare seed admin:", error.message);
    });
});
