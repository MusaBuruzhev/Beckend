const { Schema, model } = require("mongoose");

const Product = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  carModel: { type: String },
  carYear: { type: Number },
  carColor: { type: String },
  carTransmission: { type: String },
  carFuelType: { type: String },
  carSeats: { type: Number },
  carLuggage: { type: Number },
  // Владелец машины
   owner: { type: Schema.Types.ObjectId, ref: "User" }, // ✅ Это должно быть
  registrationDate: { type: Date, default: Date.now },

});

module.exports = model("Product", Product);







