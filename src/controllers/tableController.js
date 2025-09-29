import Table from "../models/TableModel.js";

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
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Table not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updateTable:", err.message);
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
