import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";
import { sendConfirmationEmail } from "../services/mailService.js";

// Tạo đặt bàn
export const createReservation = async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, tableId, date, time, guestCount } = req.body;

    // check bàn tồn tại
    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: "Table not found" });
    if (guestCount > table.capacity) return res.status(400).json({ message: "Guest count exceeds table capacity" });

    // check bàn đã được đặt chưa
    const existing = await Reservation.findOne({ tableId, date, time, status: { $ne: "cancelled" } });
    if (existing) return res.status(400).json({ message: "Table already reserved for this time slot" });

    // tạo reservation
    const newReservation = await Reservation.create({
      customerName,
      customerPhone,
      customerEmail,
      tableId,
      date,
      time,
      guestCount,
      status: "pending"
    });

    // gửi mail xác nhận (nếu có email)
    if (customerEmail) {
      await sendConfirmationEmail(customerEmail, {
        customerName,
        date,
        time,
        tableNumber: table.tableNumber,
        guestCount
      });
    }

    res.status(201).json({ message: "Reservation created", data: newReservation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// lấy danh sách booking
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("tableId", "tableNumber capacity location");
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
