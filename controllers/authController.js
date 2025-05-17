const User = require("../models/User");
const Role = require("../models/UserRole");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");
const mailer = require("../nodemailer");

const generateAccessToken = (id, roles) => {
  const payload = { id, roles };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class authController {

  async getAllUsers(req, res) {
    try {
      const users = await User.find().select("-password");
      return res.json(users);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка получения пользователей" });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (req.user.id === id) {
        return res.status(400).json({ message: "Нельзя удалить самого себя" });
      }

      await User.findByIdAndDelete(id);
      return res.status(200).json({ message: "Пользователь удалён" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка удаления пользователя" });
    }
  }

  async reqistration(req, res) {
  try {
    const { email } = req.body;

    let userRole = await Role.findOne({ value: "USER" });

    if (!userRole) {
      userRole = new Role({ value: "USER" });
      await userRole.save();
    }

    // Генерируем рандомный код (4 цифры)
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    let user = await User.findOne({ email });

    if (!user) {
      const userRole = await Role.findOne({ value: "USER" });
      user = new User({
        email,
        password: 'temporary', 
        roles: [userRole.value],
        verificationCode,
        isVerified: false
      });
      await user.save();
    } else {
      user.verificationCode = verificationCode;
      await user.save();
    }

    const message = {
      to: email,
      subject: "Код подтверждения регистрации",
      text: `Ваш код подтверждения: ${verificationCode}`,
    };
    mailer(message);

    return res.status(200).json({
      message: "На ваш email отправлен код подтверждения",
      email
    });

  } catch (e) {
    console.log(e); // 👈 Здесь должен быть точный текст ошибки
    return res.status(400).json({ message: "Ошибка регистрации" });
  }
}

async updateProfile(req, res) {
  try {
    const {
      name,
      surname,
      patronymic,
      phone,
      citizenship,
      birthDate,
      drivingExperience,
      username, // ✅ Теперь используем
      password
    } = req.body;

    const passportFiles = req.files?.passport ? req.files.passport.map(f => f.path) : [];
    const driverLicenseFiles = req.files?.driverLicense ? req.files.driverLicense.map(f => f.path) : [];

    if (passportFiles.length > 2 || driverLicenseFiles.length > 2) {
      return res.status(400).json({ message: "Можно загрузить не более 2 файлов для каждого документа" });
    }

    const updatedData = {};

    if (name) updatedData.name = name;
    if (surname) updatedData.surname = surname;
    if (patronymic) updatedData.patronymic = patronymic;
    if (phone) updatedData.phone = phone;
    if (citizenship) updatedData.citizenship = citizenship;
    if (birthDate) updatedData.birthDate = new Date(birthDate);
    if (drivingExperience) updatedData.drivingExperience = parseInt(drivingExperience, 10);

    // ✅ Вот эти два поля:
    if (username) updatedData.username = username;
    if (password) updatedData.password = bcrypt.hashSync(password, 8);

    if (passportFiles.length > 0) {
      updatedData.passportFiles = passportFiles;
      updatedData.documentsVerified = false;
    }

    if (driverLicenseFiles.length > 0) {
      updatedData.driverLicenseFiles = driverLicenseFiles;
      updatedData.documentsVerified = false;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });

    return res.status(200).json({ message: "Профиль успешно обновлён", user: updatedUser });

  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Ошибка обновления профиля" });
  }
}

  async verifyEmail(req, res) {
    try {
      const { email, code } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (user.isVerified) {
        const token = generateAccessToken(user._id, user.roles);
        return res.status(200).json({ message: "Email уже подтвержден", token });
      }

      if (user.verificationCode !== code) {
        return res.status(400).json({ message: "Неверный код" });
      }

      if (!user.password || user.password === 'temporary') {
        const generatedPassword = Math.random().toString(36).slice(-8);
        const hash = bcrypt.hashSync(generatedPassword, 8);
        user.password = hash;
      }

      const token = generateAccessToken(user._id, user.roles);
      user.isVerified = true;
      user.verificationCode = null;
      await user.save();

      return res.status(200).json({
        message: "Email успешно подтвержден",
        token
      });

    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка подтверждения" });
    }
  }

  async setRole(req, res) {
    try {
      const { id, role } = req.body;

      if (req.user.roles[0] !== "ADMIN") {
        return res.status(403).json({ message: "Нет доступа" });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const roleDoc = await Role.findOne({ value: role });
      if (!roleDoc) {
        return res.status(400).json({ message: "Роль не найдена" });
      }

      user.roles = [role];
      await user.save();

      return res.status(200).json({ message: `Роль ${role} успешно установлена` });

    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка изменения роли" });
    }
  }

  async login(req, res) {
    try {
      const { username, email, password } = req.body;

      let user;
      if (username) {
        user = await User.findOne({ username });
      } else if (email) {
        user = await User.findOne({ email });
      } else {
        return res.status(400).json({ message: "Не указан логин или email" });
      }

      if (!user) {
        return res.status(400).json({ message: "Неправильный логин или пароль, повторите вход!" });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Введен неверный логин или пароль" });
      }

      const token = generateAccessToken(user._id, user.roles);
      return res.status(200).json({ token });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка авторизации" });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка получения списка пользователей" });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      res.status(200).json({ user });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Ошибка" });
    }
  }

  async loginByEmail(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      user.verificationCode = verificationCode;
      await user.save();

      const message = {
        to: email,
        subject: "Код входа в систему",
        text: `Ваш код для входа: ${verificationCode}`,
      };
      mailer(message);

      return res.json({ message: "На ваш email отправлен код для входа", email });

    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка при входе через email" });
    }
  }

  async verifyLoginCode(req, res) {
    try {
      const { email, code } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (user.verificationCode !== code) {
        return res.status(400).json({ message: "Неверный код" });
      }

      const token = generateAccessToken(user._id, user.roles);
      user.verificationCode = null;
      await user.save();

      return res.status(200).json({
        message: "Вы успешно вошли",
        token
      });

    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка проверки кода" });
    }
  }
}

module.exports = new authController();