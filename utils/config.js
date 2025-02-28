require("dotenv").config();

// console.log("NODE_ENV in config.js:", process.env.NODE_ENV); // 🔥 Debugging line
// console.log("TEST_MONGODB_URI:", process.env.TEST_MONGODB_URI); // 🔥 Debugging line
const PORT = process.env.PORT;
const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;
// console.log("Selected DB URI:", MONGODB_URI); // 🔥 Debugging line

module.exports = {
  MONGODB_URI,
  PORT,
};
