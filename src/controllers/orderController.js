import Cart from "../models/CartModel.js";
import Order from "../models/OrderModel.js";

export const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const restaurantId = req.body?.restaurantId;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }

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
      restaurantId,
      restaurantName: req.body?.restaurantName,
      items: orderItems,
      subtotal,
      discount,
      tax,
      total,
      status: "pending",
      customerName: req.body?.customerName,
      tableNumber: req.body?.tableNumber,
    });

    // clear cart after creating order
    cart.items = [];
    await cart.save();
    
    // Lấy đơn hàng đầy đủ thông tin để trả về
    const completeOrder = await Order.findById(order._id).lean();
    
    // Đảm bảo response trả về đúng định dạng
    const formattedResponse = {
      userId: completeOrder.userId,
      restaurantId: completeOrder.restaurantId,
      items: completeOrder.items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes || "",
        total: item.total
      })),
      subtotal: completeOrder.subtotal,
      discount: completeOrder.discount,
      tax: completeOrder.tax,
      total: completeOrder.total,
      status: completeOrder.status,
      customerName: completeOrder.customerName,
      tableNumber: completeOrder.tableNumber,
      _id: completeOrder._id,
      createdAt: completeOrder.createdAt,
      updatedAt: completeOrder.updatedAt,
      __v: completeOrder.__v
    };
    
    res.status(201).json(formattedResponse);
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
    const { status, restaurantId, userId } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (restaurantId) {
      filter.restaurantId = restaurantId; // đổi đúng field
    }
    if (userId) {
      filter.userId = userId; // đổi đúng field
    }

    const orders = await Order.find(filter)
      .populate("userId", "name fullName")        // đổi đúng path
      .populate("restaurantId", "name")          // đổi đúng path
      .populate("items.menuItemId")              // đổi đúng path
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Staff list orders error:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách đơn hàng" });
  }
};

export const staffGetOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("restaurantId", "name");
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

// Xử lý feedback cho order
export const createOrderFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Đánh giá phải từ 1 đến 5 sao" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.userId.toString() !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền đánh giá đơn hàng này" });
    }

    // Nếu đã có feedback -> cập nhật, nếu chưa -> tạo mới
    if (order.feedback && (order.feedback.rating || order.feedback.comment)) {
      order.feedback.rating = rating;
      order.feedback.comment = comment;
      order.feedback.updatedAt = new Date();
      await order.save();
      return res.status(200).json({
        message: "Feedback đã được cập nhật",
        feedback: order.feedback
      });
    }

    order.feedback = { rating, comment, createdAt: new Date(), updatedAt: new Date() };
    await order.save();

    return res.status(201).json({
      message: "Cảm ơn bạn đã đánh giá!",
      feedback: order.feedback
    });
  } catch (err) {
    console.error("createOrderFeedback error:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
