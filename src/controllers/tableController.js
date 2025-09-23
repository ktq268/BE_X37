import Table from "../models/Table.js";
import Reservation from "../models/Reservation.js";

// API check bàn trống
export const checkAvailableTables = async (req, res) => {
  try {
    const { date, time, guestCount } = req.body;
    const allTables = await Table.find({ capacity: { $gte: guestCount } });

    // lấy danh sách bàn đã được đặt trong cùng date + time
    const reserved = await Reservation.find({ date, time, status: { $ne: "cancelled" } });
    const reservedIds = reserved.map(r => r.tableId.toString());

    const available = allTables.filter(t => !reservedIds.includes(t._id.toString()));

    res.status(200).json(available);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
