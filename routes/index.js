const express = require("express");
const router = express.Router();
const authRouter = require("./authRoute");
const productRouter = require("./productRoute");
const documentRouter = require("./documentRoute");
const rentalRouter = require("./rentalRoute");

module.exports = function (app) {
  app.use("/auth", authRouter);
  app.use("/product", productRouter);
  app.use("/document", documentRouter);
  app.use("/rental", rentalRouter);
};
