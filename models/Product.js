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
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  registrationDate: { type: Date, default: Date.now },

  canDeliver: { type: Boolean, default: false }, 
  address: { type: String },                   
  rentalPeriods: [{                           
    startDate: Date,
    endDate: Date
  }]
});

module.exports = model("Product", Product);





