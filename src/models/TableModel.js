import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true },
  location: { type: String }, // khu VIP, tầng 1, ngoài trời...
  status: { type: String, enum: ["available", "reserved"], default: "available" },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true } // Thêm trường facility
}, { timestamps: true });

export default mongoose.model("Table", tableSchema);