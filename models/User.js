const { Schema, model } = require("mongoose");

const User = new Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  roles: [{ type: String, ref: "Role" }],
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false },
  name: { type: String },
  surname: { type: String },
  patronymic: { type: String },
  phone: { type: String },
  citizenship: { type: String },
  birthDate: { type: Date },
  drivingExperience: { type: Number },
  passportFiles: [{ type: String }],
  documentsVerified: { type: Boolean, default: false },
});

module.exports = model("User", User);
