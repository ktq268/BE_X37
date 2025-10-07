import Booking from "../models/BookingModel.js";
import TableBlock from "../models/TableBlockModel.js";

export const createBooking = async (req, res) => {
  try {
    const { restaurantId, tableId, date, time } = req.body;

    const exists = await Booking.findOne({ restaurantId, tableId, date, time });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Table already booked at this time" });
    }

    const blocked = await TableBlock.findOne({
      restaurantId,
      tableId,
      date,
      time,
    });
    if (blocked) {
      return res.status(400).json({ message: "Table is blocked at this time" });
    }

    const booking = await Booking.create({
      ...req.body,
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error("Error createBooking:", err.message);
    res
      .status(400)
      .json({ message: "Create booking failed", error: err.message });
  }
};
