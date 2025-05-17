const jwt = require("jsonwebtoken");
const { secret } = require("../config");

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "Пользователь не авторизован" });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: "Пользователь не авторизован" });
    }

    const decodedData = jwt.verify(token, secret);
    req.user = decodedData; 
    next();
  } catch (e) {
    console.error("Ошибка авторизации:", e.message);
    return res.status(403).json({ message: "Нет доступа" });
  }
};
