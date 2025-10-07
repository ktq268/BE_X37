import Restaurant from "../models/RestaurantModel.js";
import Table from "../models/TableModel.js";
import Booking from "../models/BookingModel.js";
import TableBlock from "../models/TableBlockModel.js";

export const getAvailableTables = async (req, res) => {
  try {
    const {
      region,
      restaurantId,
      date,
      time,
      adults = 0,
      children = 0,
    } = req.body;
    console.log("API getAvailableTables query:", {
      region,
      restaurantId,
      date,
      time,
      adults,
      children
    });

    if (!region) return res.status(400).json({ message: "region is required" });
    if (!date) return res.status(400).json({ message: "date is required" });
    if (!time) return res.status(400).json({ message: "time is required" });

    const totalPeople = Number(adults) + Number(children);

    let restaurants = [];
    if (restaurantId) {
      const r = await Restaurant.findById(restaurantId);
      if (!r) return res.status(404).json({ message: "Restaurant not found" });
      if (r.region !== region)
        return res.status(400).json({ message: "Restaurant not in region" });
      restaurants = [r];
    } else {
      restaurants = await Restaurant.find({ region });
    }

    const restaurantIds = restaurants.map((r) => r._id);

    const tables = await Table.find({
      restaurantId: { $in: restaurantIds },
    }).lean();
    const bookings = await Booking.find({
      restaurantId: { $in: restaurantIds },
      date,
      time,
    }).lean();
    const blocks = await TableBlock.find({
      restaurantId: { $in: restaurantIds },
      date,
      time,
    }).lean();

    const bookedTableIds = new Set(bookings.map((b) => String(b.tableId)));
    const blockedTableIds = new Set(blocks.map((b) => String(b.tableId)));

    const availableByRestaurant = new Map();
    for (const r of restaurants) {
      availableByRestaurant.set(String(r._id), {
        restaurantId: String(r._id),
        restaurantName: r.name,
        tables: [],
      });
    }

    for (const t of tables) {
      const tid = String(t._id);
      const rid = String(t.restaurantId);
      if (bookedTableIds.has(tid)) continue;
      if (blockedTableIds.has(tid)) continue;
      if (totalPeople > 0 && t.capacity < totalPeople) continue;
      const entry = availableByRestaurant.get(rid);
      if (entry) {
        entry.tables.push({
          tableId: tid,
          tableNumber: t.tableNumber,
          capacity: t.capacity,
        });
      }
    }

    const availableRestaurants = Array.from(
      availableByRestaurant.values()
    ).filter((r) => r.tables.length > 0);

    res.json({ region, date, time, availableRestaurants });
  } catch (err) {
    console.error("Error getAvailableTables:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
