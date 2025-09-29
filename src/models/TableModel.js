import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    tableNumber: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1 },
    type: { type: String, enum: ["vip", "normal"], default: "normal" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Table = mongoose.model("Table", TableSchema);
export default Table;
