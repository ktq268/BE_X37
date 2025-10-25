import Cart from "../models/CartModel.js";
import Order from "../models/OrderModel.js";

export const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const subtotal = cart.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const discount = Number(req.body.applyDiscount || 0);
    const tax = 0; // add tax logic later if needed
    const total = Math.max(0, subtotal - discount + tax);

    const orderItems = cart.items.map((i) => ({
      menuItemId: i.menuItemId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      notes: i.notes,
      total: i.price * i.quantity,
    }));

    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal,
      discount,
      tax,
      total,
      status: "pending",
    });

    // clear cart after creating order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    console.error("createOrderFromCart error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const listMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("listMyOrders error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("getOrderDetail error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// STAFF controllers
export const staffListOrders = async (req, res) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (q) {
      // simple text search on item name
      filter["items.name"] = { $regex: q, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
    ]);

    res.json({ page: Number(page), limit: Number(limit), total, orders });
  } catch (err) {
    console.error("staffListOrders error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const staffGetOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("staffGetOrderDetail error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const validTransitions = {
  pending: "preparing",
  preparing: "served",
  served: "completed",
};

export const staffUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Kiểm tra xem có chuyển đúng thứ tự không
    const nextValid = validTransitions[order.status];
    if (
      status !== nextValid &&
      !(order.status === "pending" && status === "completed")
    ) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Status updated", status: order.status });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
