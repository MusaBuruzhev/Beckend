const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const setupRoutes = require("./routes");

const PORT = process.env.PORT || 5000;
const app = express({ limit: "100mb" });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

setupRoutes(app);

const start = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/FDrive");
    app.listen(PORT, () => {
      console.clear();
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
