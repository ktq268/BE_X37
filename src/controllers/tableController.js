import Table from "../models/TableModel.js";
import Booking from "../models/BookingModel.js";
import TableBlock from "../models/TableBlockModel.js";

export const createTable = async (req, res) => {
  try {
    if (req.user?.id) {
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

    // Kiểm tra bàn có booking đang hoạt động không
    const activeBooking = await Booking.exists({
      tableId: id,
      status: { $in: ["pending", "confirmed", "seated"] },
    });

    if (activeBooking) {
      return res.status(409).json({
        message: "Không thể xóa bàn vì đang có booking hoạt động.",
      });
    }

    // Kiểm tra bàn có bị khóa không
    const hasBlock = await TableBlock.exists({ tableId: id });
    if (hasBlock) {
      return res.status(409).json({
        message: "Không thể xóa bàn vì bàn đang bị khóa.",
      });
    }

    // Chỉ xóa các booking đã hủy hoặc hoàn thành
    await Booking.deleteMany({
      tableId: id,
      status: { $in: ["cancelled", "completed"] },
    });

    // Xóa block nếu có
    await TableBlock.deleteMany({ tableId: id });

    // Xóa bàn
    const deleted = await Table.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy bàn." });

    res.json({ message: "Xóa bàn thành công." });
  } catch (err) {
    console.error("Error deleteTable:", err.message);
    res.status(400).json({ message: "Delete table failed", error: err.message });
  }
};



export const listTablesWithStatus = async (req, res) => {
  try {
    const { restaurantId, date } = req.query;


    // Validate restaurantId if provided
    if (restaurantId && restaurantId === "undefined") {
      return res
        .status(400)
        .json({ message: "Invalid restaurantId parameter" });
    }

    const filter = {};
    if (restaurantId && restaurantId !== "undefined") {
      filter.restaurantId = restaurantId;
    }


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


    // Tính trạng thái bàn dựa trên booking/block trong ngày được chọn
    const result = tables.map((t) => {
      let computedStatus = "available"; // Mặc định là available cho mọi ngày
      let bookingInfo = null;
      let blockedInfo = null;

      // Tìm booking cho bàn này trong ngày được chọn
      const tableBooking = bookings.find(b => String(b.tableId) === String(t._id));
      const tableBlock = blocks.find(b => String(b.tableId) === String(t._id));

      // Kiểm tra trạng thái từ booking/block trong ngày được chọn
      if (blockedSet.has(t._id.toString())) {
        computedStatus = "blocked";
        blockedInfo = tableBlock;
      } else if (occupiedSet.has(t._id.toString())) {
        computedStatus = "occupied";
        bookingInfo = tableBooking;
      } else if (reservedSet.has(t._id.toString())) {
        computedStatus = "reserved";
        bookingInfo = tableBooking;
      }
      // Nếu không có booking/block nào trong ngày này, bàn sẽ trống
      else {
        computedStatus = "available";
      }

      const resultTable = {
        _id: String(t._id),
        id: String(t._id),
        restaurantId: String(t.restaurantId),
        tableNumber: t.tableNumber,
        capacity: t.capacity,
        type: t.type,
        status: computedStatus,
        updatedAt: t.updatedAt,
        createdAt: t.createdAt,
        bookingDate: normalizedDate, // Thêm ngày được chọn
      };

      // Thêm thông tin booking nếu có
      if (bookingInfo) {
        resultTable.blockedBy = `${bookingInfo.customerName} - ${bookingInfo.time}`;
        resultTable.checkInTime = bookingInfo.time;
        resultTable.orderId = bookingInfo._id;
      }

      // Thêm thông tin block nếu có
      if (blockedInfo) {
        resultTable.blockedBy = blockedInfo.reason || 'Bảo trì';
      }

      return resultTable;
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
    const { status, date } = req.body;
    const allowed = ["available", "reserved", "occupied", "blocked"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid table status" });
    }

    const targetDate = date || new Date().toISOString().slice(0, 10);

    // Kiểm tra bàn có tồn tại không
    const table = await Table.findById(id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    // 🔥 Nếu staff đổi sang "available" → hủy tất cả booking trong NGÀY đó
    if (status === "available") {
      const cancelled = await Booking.updateMany(
        {
          tableId: id,
          date: targetDate,
          status: { $in: ["pending", "confirmed", "seated"] },
        },
        { $set: { status: "cancelled", updatedAt: new Date() } }
      );

      // Xóa tất cả block trong ngày đó
      await TableBlock.deleteMany({
        tableId: id,
        date: targetDate,
      });
    }

    // 🆕 Nếu staff đổi sang "occupied" → cập nhật booking thành "seated"
    if (status === "occupied") {
      // Tìm booking "confirmed" cho bàn này trong ngày được chọn
      const confirmedBooking = await Booking.findOne({
        tableId: id,
        date: targetDate,
        status: "confirmed",
      });

      if (confirmedBooking) {
        // Cập nhật booking thành "seated"
        await Booking.findByIdAndUpdate(confirmedBooking._id, {
          status: "seated",
          updatedAt: new Date(),
          updatedBy: req.user?.id,
        });
      }
    }

    // 🆕 Nếu staff đổi sang "blocked" → tạo block cho ngày đó
    if (status === "blocked") {
      // Xóa block cũ nếu có
      await TableBlock.deleteMany({
        tableId: id,
        date: targetDate,
      });

      // Tạo block mới
      await TableBlock.create({
        restaurantId: table.restaurantId,
        tableId: id,
        date: targetDate,
        time: "00:00", // Thời gian mặc định cho block cả ngày
        reason: "Bảo trì",
        createdBy: req.user?.id,
      });
    }

    // 🆕 Nếu staff đổi sang "reserved" → tạo booking mới hoặc cập nhật booking hiện tại
    if (status === "reserved") {
      // Xóa block nếu có
      await TableBlock.deleteMany({
        tableId: id,
        date: targetDate,
      });

      // Tìm booking hiện tại trong ngày
      const existingBooking = await Booking.findOne({
        tableId: id,
        date: targetDate,
        status: { $in: ["pending", "confirmed"] },
      });

      if (!existingBooking) {
        // Tạo booking mới nếu chưa có
        await Booking.create({
          restaurantId: table.restaurantId,
          tableId: id,
          date: targetDate,
          time: "12:00", // Thời gian mặc định
          customerName: "Khách lẻ",
          customerPhone: "0000000000",
          customerEmail: "guest@restaurant.com",
          adults: 1,
          children: 0,
          status: "confirmed",
          createdBy: req.user?.id,
        });
      }
    }

    // Trả về thông tin bàn với trạng thái được tính toán lại
    res.json({
      message: "Table status updated successfully for the selected date",
      table: {
        _id: table._id,
        id: String(table._id),
        restaurantId: String(table.restaurantId),
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        type: table.type,
        status: status,
        bookingDate: targetDate,
      },
    });
  } catch (err) {
    console.error("Error updateTableStatus:", err.message);
    res
      .status(400)
      .json({ message: "Update table status failed", error: err.message });
  }
};
