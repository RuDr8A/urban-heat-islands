require('dotenv').config();
const express = require('express');
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
}));

// Add any future non-auth Node routes here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));