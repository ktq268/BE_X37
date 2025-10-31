import MenuItem from "../models/MenuItemModel.js";

// Public: list by category or search (no pagination)
export const listMenu = async (req, res) => {
  try {
    const { category, q } = req.query;
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q, $options: "i" };

    const items = await MenuItem.find().sort({ name: 1 }).lean();

    res.json({ items });
  } catch (err) {
    console.error("[menu][listMenu]", err.message);
    res.status(500).send("Server error");
  }
};

// Public: detail by id
export const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id).lean();
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (err) {
    console.error("[menu][getMenuItem]", err.message);
    res.status(400).json({ message: "Invalid id" });
  }
};

// Public: full list grouped by category (no pagination)
export const listFullMenu = async (req, res) => {
  try {

    const menuGroups = await MenuItem.aggregate([
      {
        $group: {
          _id: "$category",
          items: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          category: { _id: "$_id", name: "$_id" },
          items: 1,
        },  
      },
    ]);

    res.json(menuGroups);
  } catch (err) {
    console.error("[menu][listFullMenu]", err.message);
    res.status(500).send("Server error");
  }
};

// Admin: create
export const createMenuItem = async (req, res) => {
  try {
    const created = await MenuItem.create({
      ...req.body,
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("[menu][create]", err.message);
    res
      .status(400)
      .json({ message: "Create menu item failed", error: err.message });
  }
};

// Admin: update
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    if (body.imageUrl && !Array.isArray(body.imageUrl)) {
      body.imageUrl = [body.imageUrl];
    }

    const updated = await MenuItem.findByIdAndUpdate(
      id,
      { ...body, updatedBy: req.user?.id },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Menu item not found" });
    res.json(updated);
  } catch (err) {
    console.error("[menu][update]", err.message);
    res
      .status(400)
      .json({ message: "Update menu item failed", error: err.message });
  }
};

// Admin: delete
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MenuItem.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Menu item not found" });
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    console.error("[menu][delete]", err.message);
    res
      .status(400)
      .json({ message: "Delete menu item failed", error: err.message });
  }
};
