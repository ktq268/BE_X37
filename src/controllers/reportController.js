import dayjs from "dayjs";
import Booking from "../models/BookingModel.js";
import Feedback from "../models/FeedbackModel.js";
import MenuItem from "../models/MenuItemModel.js";

export const getRevenueReport = async (req, res) => {
  try {
    const { restaurantId, range, from, to } = req.query;

    // ✅ Kiểm tra xem có chọn chi nhánh chưa
    if (!restaurantId || restaurantId === "none") {
      return res.status(400).json({ message: "Vui lòng chọn chi nhánh để xem báo cáo" });
    }

    let startDate, endDate;
    const now = dayjs();

    switch (range) {
      case "today":
        startDate = now.startOf("day");
        endDate = now.endOf("day");
        break;
      case "yesterday":
        startDate = now.subtract(1, "day").startOf("day");
        endDate = now.subtract(1, "day").endOf("day");
        break;
      case "week":
        startDate = now.startOf("week");
        endDate = now.endOf("week");
        break;
      case "lastWeek":
        startDate = now.subtract(1, "week").startOf("week");
        endDate = now.subtract(1, "week").endOf("week");
        break;
      case "month":
        startDate = now.startOf("month");
        endDate = now.endOf("month");
        break;
      case "lastMonth":
        startDate = now.subtract(1, "month").startOf("month");
        endDate = now.subtract(1, "month").endOf("month");
        break;
      case "custom":
        if (!from || !to)
          return res.status(400).json({ message: "Cần chọn ngày bắt đầu và kết thúc cho khoảng thời gian tùy chỉnh" });
        startDate = dayjs(from);
        endDate = dayjs(to);
        break;
      default:
        return res.status(400).json({ message: "Khoảng thời gian không hợp lệ" });
    }

    const bookings = await Booking.find({
      restaurantId,
      status: { $in: ["completed", "confirmed"] },
      createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total || 0), 0);

    return res.json({
      totalRevenue,
      totalBookings: bookings.length,
      startDate,
      endDate
    });
  } catch (err) {
    console.error("Error getRevenueReport:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTopMenuItems = async (req, res) => {
  const { from, to } = req.query;
  const topItems = await MenuItem.aggregate([
    { $match: { "orders.date": { $gte: new Date(from), $lte: new Date(to) } } },
    { $unwind: "$orders" },
    { $group: { _id: "$name", sold: { $sum: "$orders.quantity" } } },
    { $sort: { sold: -1 } },
    { $limit: 5 }
  ]);
  res.json(topItems);
};

export const getFeedbackReport = async (req, res) => {
  const stats = await Feedback.aggregate([
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
  res.json(stats);
};
