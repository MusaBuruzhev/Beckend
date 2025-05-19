const Product = require("../models/Product");
const User = require("../models/User");

class ProductController {
async addProduct(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);


    if (
      !user.name || 
      !user.surname || 
      !user.phone || 
      !user.citizenship || 
      !user.birthDate || 
      !user.drivingExperience ||
      user.passportFiles.length === 0
    ) {
      return res.status(400).json({ message: "Профиль пользователя заполнен не полностью" });
    }

    if (!user.documentsVerified) {
      return res.status(403).json({ message: "Ваши документы ещё не проверены админом" });
    }

    let imagePaths = '';

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        imagePaths += file.path;
        if (index + 1 < req.files.length) {
          imagePaths += ' , ';
        }
      });
    } else {
      imagePaths = "uploads/no_img.png";
    }

 
    const { name, description, price } = req.body;

    const product = new Product({
      name,
      description,
      price,
      image: imagePaths,
      owner: userId,
    });

    await product.save();

    return res.status(200).json({ message: "Машина успешно добавлена!", product });

  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Ошибка добавления машины" });
  }
}

  async getProducts(req, res) {
  try {
    const { from, to } = req.query;
    let query = {};

    if (from && to) {
      const startDate = new Date(from);
      const endDate = new Date(to);

      query = {
        rentalPeriods: {
          $not: {
            $elemMatch: {
              startDate: { $lte: endDate },
              endDate: { $gte: startDate }
            }
          }
        }
      };
    }

    const products = await Product.find(query);
    return res.json(products);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Ошибка получения продуктов" });
  }
}

  async getOneProduct(req, res) {
    try {
      const id = req.params.id;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Продукт не найден" });
      }
      return res.json(product);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка получения продукта" });
    }
  }

  async updateProduct(req, res) {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Машина не найдена" });
      }

      const userId = req.user.id;
      const user = await User.findById(userId);

      if (user.roles[0] !== "ADMIN" && product.owner.toString() !== userId) {
        return res.status(403).json({ message: "Нет доступа" });
      }

      const { name, price, description } = req.body;
      await Product.findByIdAndUpdate(productId, { name, price, description });

      return res.status(200).json({ message: "Машина обновлена!" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка изменения" });
    }
  }

  async deleteOneProduct(req, res) {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Машина не найдена" });
      }

      const userId = req.user.id;
      const user = await User.findById(userId);

      if (user.roles[0] !== "ADMIN" && product.owner.toString() !== userId) {
        return res.status(403).json({ message: "Нет доступа" });
      }

      await Product.findByIdAndDelete(productId);
      return res.status(200).json({ message: "Машина удалена!" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка удаления" });
    }
  }
  async getMyProducts(req, res) {
    try {
      const userId = req.user.id;
      const products = await Product.find({ owner: userId });
      return res.json(products);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка получения ваших машин" });
    }
  }
}

module.exports = new ProductController();