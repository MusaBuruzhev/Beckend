
const User = require("../models/User");
const { Schema, model } = require("mongoose");

const rentalSchema = new Schema({
  car: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled", "completed"],
    default: "pending"
  },

    paymentType: {
    type: String,
    enum: ["online", "cash"],
    default: "online"
    },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model("Rental", rentalSchema);