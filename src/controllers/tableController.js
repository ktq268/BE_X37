import Table from "../models/TableModel.js";
import Booking from "../models/BookingModel.js";
import TableBlock from "../models/TableBlockModel.js";

export const createTable = async (req, res) => {
  try {
    if (req.user?.id) {
      console.log(`[table][create] by user=${req.user.id}`);
    }
    const table = await Table.create({
      ...req.body,
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });
    res.status(201).json(table);
  } catch (err) {
    console.error("Error createTable:", err.message);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Table number already exists in restaurant" });
    }
    res
      .status(400)
      .json({ message: "Create table failed", error: err.message });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user?.id) {
      console.log(`[table][update] id=${id} by user=${req.user.id}`);
    }
    const updated = await Table.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Table not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updateTable:", err.message);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Table number already exists in restaurant" });
    }
    res
      .status(400)
      .json({ message: "Update table failed", error: err.message });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user?.id) {
      console.log(`[table][delete] id=${id} by user=${req.user.id}`);
    }
    // Prevent delete if has bookings or blocks
    const hasBooking = await Booking.exists({ tableId: id });
    if (hasBooking) {
      return res
        .status(409)
        .json({ message: "Cannot delete: table has bookings" });
    }
    const hasBlock = await TableBlock.exists({ tableId: id });
    if (hasBlock) {
      return res
        .status(409)
        .json({ message: "Cannot delete: table has blocks" });
    }

    const deleted = await Table.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Table not found" });
    res.json({ message: "Table deleted" });
  } catch (err) {
    console.error("Error deleteTable:", err.message);
    res
      .status(400)
      .json({ message: "Delete table failed", error: err.message });
  }
};

export const listTablesWithStatus = async (req, res) => {
  try {
    const { restaurantId, date, time } = req.query;

    const filter = {};
    if (restaurantId) filter.restaurantId = restaurantId;

    const tables = await Table.find(filter).lean();
    if (!tables.length) return res.json([]);

    let bookings = [];
    let blocks = [];

    if (date && time) {
      const tableIds = tables.map((t) => t._id);
        
      // Chuẩn hóa date và time cho chắc chắn
      const normalizedDate = date.length === 10 ? date : date.slice(0, 10); // YYYY-MM-DD
      const normalizedTime = time.length === 5 ? time : time.slice(0, 5);   // HH:mm
        
      bookings = await Booking.find({ 
        tableId: { $in: tableIds }, 
        date: normalizedDate,
        time: normalizedTime
      }).lean();
    
      blocks = await TableBlock.find({ 
        tableId: { $in: tableIds }, 
        date: normalizedDate,
        time: normalizedTime
      }).lean();
    
      console.log("Normalized query:", normalizedDate, normalizedTime);
      console.log("Bookings matched:", bookings);
      console.log("Blocks matched:", blocks);
    }

    const reservedSet = new Set(
      bookings
        .filter((b) => ["pending", "confirmed"].includes(b.status))
        .map((b) => String(b.tableId))
    );

    const occupiedSet = new Set(
      bookings
        .filter((b) => b.status === "seated")
        .map((b) => String(b.tableId))
    );

    const blockedSet = new Set(blocks.map((b) => String(b.tableId)));

    const result = tables.map((t) => {
      // mặc định lấy status trong DB
      let computedStatus = t.status || "available";

      // ghi đè theo booking/block
      if (blockedSet.has(String(t._id))) {
        computedStatus = "blocked";
      } else if (occupiedSet.has(String(t._id))) {
        computedStatus = "occupied";
      } else if (reservedSet.has(String(t._id))) {
        computedStatus = "reserved";
      }

      return {
        id: String(t._id),
        restaurantId: String(t.restaurantId),
        tableNumber: t.tableNumber,
        capacity: t.capacity,
        type: t.type,
        status: computedStatus,
        updatedAt: t.updatedAt,
        createdAt: t.createdAt,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error listTablesWithStatus:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



export const updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["available", "reserved", "occupied", "blocked"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid table status" });
    }
    const updated = await Table.findByIdAndUpdate(
      id,
      { status, updatedBy: req.user?.id },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Table not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updateTableStatus:", err.message);
    res.status(400).json({ message: "Update table status failed", error: err.message });
  }
};
