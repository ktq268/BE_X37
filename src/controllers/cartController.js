import Cart from "../models/CartModel.js";
import MenuItem from "../models/MenuItemModel.js";

export const getMyCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    res.json(cart);
  } catch (err) {
    console.error("getMyCart error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const addItemToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { menuItemId, quantity, notes } = req.body;

    const item = await MenuItem.findById(menuItemId);
    if (!item || !item.isAvailable) {
      return res
        .status(404)
        .json({ message: "Menu item not found or unavailable" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const idx = cart.items.findIndex(
      (i) => String(i.menuItemId) === String(menuItemId)
    );
    if (idx >= 0) {
      cart.items[idx].quantity += quantity || 1;
      if (notes !== undefined) cart.items[idx].notes = notes;
      cart.items[idx].name = item.name;
      cart.items[idx].price = item.price;
    } else {
      cart.items.push({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: quantity || 1,
        notes,
      });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    console.error("addItemToCart error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { itemId } = req.params; // menuItemId
    const { quantity, notes } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const idx = cart.items.findIndex(
      (i) => String(i.menuItemId) === String(itemId)
    );
    if (idx < 0) return res.status(404).json({ message: "Item not in cart" });

    cart.items[idx].quantity = quantity;
    if (notes !== undefined) cart.items[idx].notes = notes;

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("updateCartItem error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { itemId } = req.params; // menuItemId

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const before = cart.items.length;
    cart.items = cart.items.filter(
      (i) => String(i.menuItemId) !== String(itemId)
    );
    if (before === cart.items.length) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("removeCartItem error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("clearCart error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
