import mongoose from "mongoose";

const FacilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      enum: ["Miền Bắc", "Miền Trung", "Miền Nam"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    manager: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    coordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    operatingHours: {
      open: {
        type: String,
        required: true,
      },
      close: {
        type: String,
        required: true,
      },
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
FacilitySchema.index({ region: 1 });
FacilitySchema.index({ status: 1 });
FacilitySchema.index({ name: "text", address: "text", description: "text" });

const Facility = mongoose.model("Facility", FacilitySchema);

export default Facility;
