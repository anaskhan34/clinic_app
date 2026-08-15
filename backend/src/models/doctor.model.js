import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
    },

    specialization: {
      type: String,
      required: true,
    },

    qualification: {
      type: String,
    },

    experience: {
      type: Number,
    },

    consultationFee: {
      type: Number,
    },

    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    available: {
      type: Boolean,
      default: true,
    },
    schedule: {
      monday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        enabled: { type: Boolean, default: true },
      },
      tuesday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        enabled: { type: Boolean, default: true },
      },
      wednesday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        enabled: { type: Boolean, default: true },
      },
      thursday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        enabled: { type: Boolean, default: true },
      },
      friday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "13:00" },
        enabled: { type: Boolean, default: true },
      },
      saturday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "13:00" },
        enabled: { type: Boolean, default: true },
      },
      sunday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        enabled: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  },
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
