import TableBlock from "../models/TableBlockModel.js";

export const createTableBlock = async (req, res) => {
  try {
    if (req.user?.id) {
      console.log(`[table-block][create] by user=${req.user.id}`);
    }
    const block = await TableBlock.create({
      ...req.body,
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });
    res.status(201).json(block);
  } catch (err) {
    console.error("Error createTableBlock:", err.message);
    res
      .status(400)
      .json({ message: "Create block failed", error: err.message });
  }
};

export const deleteTableBlock = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user?.id) {
      console.log(`[table-block][delete] id=${id} by user=${req.user.id}`);
    }
    const deleted = await TableBlock.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Block not found" });
    res.json({ message: "Block removed" });
  } catch (err) {
    console.error("Error deleteTableBlock:", err.message);
    res
      .status(400)
      .json({ message: "Delete block failed", error: err.message });
  }
};
