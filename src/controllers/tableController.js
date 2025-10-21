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
    const { restaurantId, date } = req.query;
    const filter = {};
    if (restaurantId) filter.restaurantId = restaurantId;

    const tables = await Table.find(filter).lean();
    if (!tables.length) return res.json([]);

    // 🕓 Xác định ngày được chọn hoặc hôm nay
    const today = new Date().toISOString().slice(0, 10);
    const normalizedDate =
      date && date.length === 10 ? date : date ? date.slice(0, 10) : today;

    const tableIds = tables.map((t) => t._id);

    // 🔎 Chỉ lấy booking + block trong NGÀY ĐÓ
    const [bookings, blocks] = await Promise.all([
      Booking.find({
        tableId: { $in: tableIds },
        date: normalizedDate,
      }).lean(),
      TableBlock.find({
        tableId: { $in: tableIds },
        date: normalizedDate,
      }).lean(),
    ]);

    console.log(`[table][listWithStatus] date=${normalizedDate}, found ${bookings.length} bookings, ${blocks.length} blocks`);
    console.log(`[table][listWithStatus] bookings:`, bookings.map(b => ({
      id: b._id,
      tableId: b.tableId,
      status: b.status,
      date: b.date,
      time: b.time
    })));

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

    console.log(`[table][listWithStatus] reservedSet:`, Array.from(reservedSet));
    console.log(`[table][listWithStatus] occupiedSet:`, Array.from(occupiedSet));
    console.log(`[table][listWithStatus] blockedSet:`, Array.from(blockedSet));

    // Tính trạng thái bàn
    const result = tables.map((t) => {
      let computedStatus = "available"; // Mặc định là available
      
      // Kiểm tra trạng thái từ booking/block trước (trạng thái động)
      if (blockedSet.has(t._id.toString())) {
        computedStatus = "blocked";
      } else if (occupiedSet.has(t._id.toString())) {
        computedStatus = "occupied";
      } else if (reservedSet.has(t._id.toString())) {
        computedStatus = "reserved";
      }
      // Nếu không có booking/block nào, sử dụng trạng thái của bàn
      else {
        computedStatus = t.status || "available";
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
    console.log(`[table][updateTableStatus] received request for table=${req.params.id} with status=${req.body.status} and date=${req.body.date}`);
    const { id } = req.params;
    const { status, date } = req.body;
    const allowed = ["available", "reserved", "occupied", "blocked"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid table status" });
    }

    const targetDate = date || new Date().toISOString().slice(0, 10);

    // 🔥 Nếu staff đổi sang "available" → hủy tất cả booking trong NGÀY đó
    if (status === "available") {
      console.log(`[table][status-update] Attempting to cancel bookings for table=${id} on ${targetDate} with status in ['pending', 'confirmed']`);
      const cancelled = await Booking.updateMany(
        {
          tableId: id,
          date: targetDate, // Fixed: changed from 'today' to 'targetDate'
          status: { $in: ["pending", "confirmed"] },
        },
        { $set: { status: "cancelled", updatedAt: new Date() } }
      );
      console.log(
        `[table][status-update] cancelled ${cancelled.modifiedCount} bookings for table=${id} on ${targetDate}`
      );
    }
    
    // 🆕 Nếu staff đổi sang "occupied" → cập nhật booking thành "seated"
    if (status === "occupied") {
      // Tìm booking "confirmed" cho bàn này trong ngày hôm nay
      const confirmedBooking = await Booking.findOne({
        tableId: id,
        date: targetDate,
        status: "confirmed"
      });
      
      if (confirmedBooking) {
        // Cập nhật booking thành "seated"
        await Booking.findByIdAndUpdate(
          confirmedBooking._id,
          { status: "seated", updatedAt: new Date(), updatedBy: req.user?.id }
        );
        console.log(
          `[table][status-update] updated booking ${confirmedBooking._id} to \"seated\" for table=${id} on ${targetDate}`
        );
      }
    }

    const updated = await Table.findByIdAndUpdate(
      id,
      { status, updatedBy: req.user?.id },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Table not found" });

    res.json({
      message: "Table status updated successfully",
      table: updated,
    });
  } catch (err) {
    console.error("Error updateTableStatus:", err.message);
    res
      .status(400)
      .json({ message: "Update table status failed", error: err.message });
  }
};