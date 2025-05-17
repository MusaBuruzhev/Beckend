const path = require('path');
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
        ) {
            callback(null, true);
        } else {
            console.log("Допускаются  только файлы формата JPG/JPEG/PNG");

            callback(new Error("Ошибка загрузки"), false);
        }


    },
    limits: {
        fileSize: 1024 * 1024 * 20 
    }
});

module.exports = upload;