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

  async registration(req, res) {
    try {
      const { email } = req.body;
      const username = email.split("@")[0];

      let userRole = await Role.findOne({ value: "USER" });
      if (!userRole) {
        userRole = new Role({ value: "USER" });
        await userRole.save();
      }

      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          username,
          password: undefined,
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
      return res.status(200).json({ message: "На ваш email отправлен код подтверждения", email });
    } catch (e) {
      if (e.code === 11000 && e.keyPattern?.username) {
        return res.status(400).json({ message: "Этот логин уже занят", field: "username" });
      }
      console.log(e);
      return res.status(400).json({ message: "Ошибка регистрации" });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { email, code } = req.body;
      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ message: "Пользователь не найден" });

      if (user.isVerified) {
        const token = generateAccessToken(user._id, user.roles);
        return res.status(200).json({ message: "Email уже подтвержден", token });
      }

      if (user.verificationCode !== code) {
        return res.status(400).json({ message: "Неверный код" });
      }

      if (!user.password || user.password === 'temporary') {
        const generatedPassword = Math.random().toString(36).slice(-8);
        user.password = bcrypt.hashSync(generatedPassword, 8);
      }

      user.isVerified = true;
      user.verificationCode = null;
      await user.save();

      const token = generateAccessToken(user._id, user.roles);
      return res.status(200).json({ message: "Email успешно подтвержден", token });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка подтверждения" });
    }
  }

  async login(req, res) {
    try {
      const { username, email, password, code } = req.body;
      let user;

      if (username) user = await User.findOne({ username });
      else if (email) user = await User.findOne({ email });
      else return res.status(400).json({ message: "Не указан логин или email" });

      if (!user) return res.status(400).json({ message: "Пользователь не найден" });

      if (code) {
        if (user.verificationCode !== code) return res.status(400).json({ message: "Неверный код" });
        user.verificationCode = null;
        await user.save();
      } else {
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Неверный логин или пароль" });
      }

      const token = generateAccessToken(user._id, user.roles);
      return res.status(200).json({ token });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка авторизации" });
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
        username,
        password
      } = req.body;

      const passportFiles = req.files?.passport ? req.files.passport.map(f => f.path) : [];
      if (passportFiles.length > 2) {
        return res.status(400).json({ message: "Можно загрузить не более 2 файлов для паспорта" });
      }

      const updatedData = {};
      if (name) updatedData.name = name;
      if (surname) updatedData.surname = surname;
      if (patronymic) updatedData.patronymic = patronymic;
      if (phone) updatedData.phone = phone;
      if (citizenship) updatedData.citizenship = citizenship;
      if (birthDate) updatedData.birthDate = new Date(birthDate);
      if (drivingExperience) updatedData.drivingExperience = parseInt(drivingExperience, 10);
      if (username) updatedData.username = username;
      if (password) updatedData.password = bcrypt.hashSync(password, 8);
      if (passportFiles.length > 0) {
        updatedData.passportFiles = passportFiles;
        updatedData.documentsVerified = false;
      }

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "Пользователь не найден" });

      const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });
      return res.status(200).json({ message: "Профиль успешно обновлён", user: updatedUser });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка обновления профиля" });
    }
  }

  async deleteMyAccount(req, res) {
    try {
      const userId = req.user.id;
      await User.findByIdAndDelete(userId);
      return res.status(200).json({ message: "Ваш аккаунт успешно удалён" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка удаления аккаунта" });
    }
  }
}

module.exports = new authController();
