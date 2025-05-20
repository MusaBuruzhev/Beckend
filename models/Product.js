const { Schema, model } = require("mongoose");


const Product = new Schema({
  name: { type: String, required: true },            
  carModel: { type: String},       
  price: { type: Number, required: true },           
  description: { type: String, required: true },     
  image: { type: String, required: true },         
  carYear: { type: Number },                        
  carColor: { type: String },                     
  carTransmission: { type: String },               
  carFuelType: { type: String },                   
  carSeats: { type: Number },                   
  carLuggage: { type: Number },                    
  canDeliver: { type: Boolean, default: false },     
  address: { type: String },                       
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  registrationDate: { type: Date, default: Date.now },
  rentalPeriods: [{                               
    startDate: Date,
    endDate: Date
  }]
});

module.exports = model("Product", Product);





