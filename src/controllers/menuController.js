import MenuItem from "../models/MenuItemModel.js";

// Public: list by category or search
export const listMenu = async (req, res) => {
  try {
    const { category, q, page = 1, limit = 20 } = req.query;
    const filter = { isAvailable: true };
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q, $options: "i" };
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      MenuItem.countDocuments(filter),
    ]);
    res.json({
      items,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
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

// Public: full list with pagination (max 9 per page)
export const listFullMenu = async (req, res) => {
  try {
    // 1. **Bỏ qua Phân trang theo limit/skip ở đây**
    //    vì Aggregation $group không dễ kết hợp với phân trang item
    //    Nếu bạn muốn phân trang theo nhóm (category), cần logic phức tạp hơn.
    //    Nếu chỉ muốn lấy FULL MENU đã nhóm (Front-end sẽ tự handle limit/pagination)

    // Đảm bảo chỉ lấy các món ăn có sẵn
    const filter = { isAvailable: true };

    const menuGroups = await MenuItem.aggregate([
      // 1. Lọc các món ăn có sẵn
      { $match: filter },
      // 2. Nhóm các món ăn theo trường 'category'
      {
        $group: {
          _id: "$category", // Nhóm theo giá trị của trường category
          items: { $push: "$$ROOT" }, // Đưa toàn bộ tài liệu (món ăn) vào mảng 'items'
        },
      },
      // 3. (Tùy chọn) Sắp xếp các nhóm theo tên category
      {
        $sort: { _id: 1 }, // Sắp xếp theo tên category
      },
      // 4. (Tùy chọn) Định dạng lại kết quả để khớp với mong đợi của FE
      {
        $project: {
          _id: 0, // Loại bỏ trường _id của nhóm
          category: { _id: "$_id", name: "$_id" }, // Tạo object category
          items: 1,
        },
      },
    ]);

    // Trả về mảng các nhóm menu
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
    const updated = await MenuItem.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: req.user?.id },
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
