const User = require("../models/User");
const Rental = require("../models/Rental");
const Product = require("../models/Product");
const mailer = require("../nodemailer");

class RentalController {
  async createRental(req, res) {
    try {
      const { carId, startDate, endDate, phoneNumber } = req.body;
      const userId = req.user.id;

      const car = await Product.findById(carId);
      if (!car) return res.status(404).json({ message: "Автомобиль не найден" });

      const isOverlapping = car.rentalPeriods.some(period => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        const requestedStart = new Date(startDate);
        const requestedEnd = new Date(endDate);

        return (requestedStart < periodEnd && requestedEnd > periodStart);
      });

      if (isOverlapping) {
        return res.status(400).json({ message: "Автомобиль уже забронирован на эти даты" });
      }

      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      const totalPrice = days * car.price;

      car.rentalPeriods.push({ startDate, endDate });
      await car.save();

      const user = await User.findById(userId);

      const rental = new Rental({
        car: car._id,
        user: userId,
        owner: car.owner,
        startDate,
        endDate,
        totalPrice,
        phoneNumber,
        status: 'pending'
      });

      await rental.save();

      const owner = await User.findById(car.owner);
      const message = {
        to: owner.email,
        subject: "Новый запрос на аренду",
        text: `
Новый запрос на аренду вашего автомобиля "${car.name}".

Информация о клиенте:
Имя: ${user.name || user.username}
Email: ${user.email}
Телефон: ${phoneNumber}

Даты аренды: с ${startDate} по ${endDate}
Сумма: ${totalPrice} руб.
        `,
      };

      mailer(message);

      return res.status(201).json({
        message: "Аренда успешно создана",
        rental
      });

    } catch (e) {
      console.error("Ошибка создания аренды:", e.message);
      return res.status(500).json({ message: "Ошибка создания аренды" });
    }
  }

  async payRental(req, res) {
    try {
      const { rentalId } = req.body;

      const rental = await Rental.findById(rentalId);
      if (!rental) return res.status(404).json({ message: "Аренда не найдена" });

      if (rental.status !== 'pending') {
        return res.status(400).json({ message: "Аренда уже обработана" });
      }

      rental.status = 'paid';
      await rental.save();

      return res.json({ message: "Аренда успешно оплачена", rental });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Ошибка при оплате аренды" });
    }
  }

  async getMyRentals(req, res) {
    try {
      const rentals = await Rental.find({ user: req.user.id })
        .populate("car")
        .populate("owner", "name email");

      return res.json(rentals);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Ошибка получения истории аренд" });
    }
  }

  async getIncomingRequests(req, res) {
    try {
      const rentals = await Rental.find({ owner: req.user.id })
        .populate("car")
        .populate("user", "name email");

      return res.json(rentals);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Ошибка получения входящих заявок" });
    }
  }

  async updateRentalStatus(req, res) {
    try {
      const { rentalId, status } = req.body;

      const allowedStatuses = ['paid', 'cancelled', 'completed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Некорректный статус" });
      }

      const rental = await Rental.findById(rentalId);
      if (!rental) return res.status(404).json({ message: "Аренда не найдена" });

      if (rental.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: "Нет прав для изменения статуса" });
      }

      rental.status = status;
      await rental.save();

      const user = await User.findById(rental.user);
      const car = await Product.findById(rental.car);

      const message = {
        to: user.email,
        subject: `Статус аренды изменён на "${status}"`,
        text: `
Статус вашей аренды "${car.name}" изменён на "${status}".

${status === 'paid' ? "Продавец подтвердил оплату." : "Заявка отклонена."}
        `
      };

      mailer(message);

      return res.json({ message: `Статус аренды изменён на "${status}"`, rental });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Ошибка изменения статуса аренды" });
    }
  }
}

module.exports = new RentalController();
