import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    image: {
      type: String,
      default: "",
    },

    openingTime: {
      type: String,
    },

    closingTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Clinic = mongoose.model("Clinic", clinicSchema);
