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
    status: {
      type: String,
      enum: ["available", "reserved", "occupied", "blocked"],
      default: "available",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Table = mongoose.model("Table", TableSchema);
TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });
export default Table;