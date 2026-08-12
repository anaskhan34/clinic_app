import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    appointmentDate: {
      type: String,
      required: true,
    },

    appointmentTime: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },

    queueNumber: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

appointmentSchema.index(
  {
    doctor: 1,
    appointmentDate: 1,
    appointmentTime: 1,
  },
  {
    unique: true,
  },
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
