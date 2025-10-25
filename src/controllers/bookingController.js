import Booking from "../models/BookingModel.js";
import TableBlock from "../models/TableBlockModel.js";
import Table from "../models/TableModel.js";
import { sendConfirmationEmail, sendCancelEmail } from "../services/mailService.js";

export const createBooking = async (req, res) => {
  try {
    const { restaurantId, date, time } = req.body;
    
    // Nếu có tableId thì kiểm tra conflict, nếu không thì chỉ tạo booking chung
    if (req.body.tableId) {
      const exists = await Booking.findOne({ restaurantId, tableId: req.body.tableId, date, time });
      if (exists) {
        return res
          .status(400)
          .json({ message: "Table already booked at this time" });
      }

      const blocked = await TableBlock.findOne({
        restaurantId,
        tableId: req.body.tableId,
        date,
        time,
      });
      if (blocked) {
        return res.status(400).json({ message: "Table is blocked at this time" });
      }
    }

    const booking = await Booking.create({
      ...req.body,
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error("Error createBooking:", err.message);
    res.status(400).json({ message: "Create booking failed", error: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tableId } = req.body;
    const allowed = ["pending", "confirmed", "seated", "completed", "cancelled", "no_show"];
    
    console.log(`[booking][updateStatus] id=${id}, status=${status}, tableId=${tableId}`);
    
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }
    
    const prev = await Booking.findById(id);
    if (!prev) return res.status(404).json({ message: "Booking not found" });
    if (prev.status === status) return res.json(prev);

    console.log(`[booking][updateStatus] prev status=${prev.status} -> new status=${status}`);

    // Cập nhật booking
    const updateData = { status, updatedBy: req.user?.id };
    if (tableId) updateData.tableId = tableId;

    const updated = await Booking.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    
    console.log(`[booking][updateStatus] updated successfully: ${JSON.stringify({
      id: updated._id,
      status: updated.status,
      tableId: updated.tableId,
      date: updated.date,
      time: updated.time
    })}`);
    
    // Gửi email thông báo (không chặn luồng chính)
    sendBookingStatusEmail(updated, status);
    
    res.json(updated);
  } catch (err) {
    console.error("Error updateBookingStatus:", err.message);
    res.status(400).json({ message: "Update booking status failed", error: err.message });
  }
};

// Hàm phụ trợ để gửi email (có thể chuyển vào service)
const sendBookingStatusEmail = async (booking, status) => {
  try {
    const to = booking.customerEmail;
    if (!to) return;
    
    const table = await Table.findById(booking.tableId).lean();
    const payload = {
      customerName: booking.customerName,
      date: booking.date,
      time: booking.time,
      tableNumber: table?.tableNumber ?? "N/A",
      guestCount: (booking.adults ?? 0) + (booking.children ?? 0),
    };
    
    if (status === "confirmed") {
      await sendConfirmationEmail(to, payload);
    } else if (status === "cancelled") {
      await sendCancelEmail(to, payload);
    }
  } catch (mailErr) {
    console.error("[mail] booking status notify failed:", mailErr.message);
  }
};

export const listBookingsByTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { date } = req.query;
    const filter = { tableId };
    if (date) filter.date = date;
    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).lean();
    res.json(bookings);
  } catch (err) {
    console.error("Error listBookingsByTable:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getPendingBookings = async (req, res) => {
  try {
    const { restaurantId, region } = req.query;
    
    // Build filter object
    const filter = { status: "pending" };
    
    // Filter by restaurantId if provided
    if (restaurantId && restaurantId !== "all") {
      filter.restaurantId = restaurantId;
    }
    
    // If region is provided, we need to populate restaurant info to filter by region
    let bookings;
    if (region && region !== "all") {
      // First get restaurants in the region
      const Restaurant = (await import("../models/RestaurantModel.js")).default;
      const restaurantsInRegion = await Restaurant.find({ region }).select('_id');
      const restaurantIds = restaurantsInRegion.map(r => r._id);
      
      // Filter bookings by restaurants in the region
      filter.restaurantId = { $in: restaurantIds };
    }
    
    bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('tableId', 'tableNumber')
      .populate('restaurantId', 'name region address')
      .lean();
      
    res.json(bookings);
  } catch (err) {
    console.error("Error getPendingBookings:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};