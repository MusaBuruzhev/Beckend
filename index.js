const express = require("express");
require("dotenv").config();
const cors = require('cors')
const { default: mongoose } = require("mongoose");
const authRouter = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");
const PORT = process.env.PORT || 5000;
const documentRoute = require("./routes/documentRoute");
const rentalRoute = require("./routes/rentalRoute"); 


const notificationRoute = require("./routes/notificationRoute");


const app = express({ limit: "100mb" });

app.use(cors())

app.use(express.json())
app.use('/auth' , authRouter)
app.use('/product' , productRoute)
app.use("/uploads" , express.static("uploads"))
app.use('/document', documentRoute);
app.use('/rental', rentalRoute); 
app.use('/notification', notificationRoute); 

const start = async () => {
  try {

    await mongoose.connect('mongodb://localhost:27017/FDrive')
    app.listen(PORT, () => {
      console.clear();
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};


start()