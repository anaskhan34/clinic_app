import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Clinic } from "../models/clinic.model.js";
import { sendAppointmentConfirmation } from "../services/email.service.js";
import { User } from "../models/user.model.js";

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, clinicId, appointmentDate, appointmentTime, reason } =
      req.body;

    // Required fields
    if (!doctorId || !clinicId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor, clinic, appointment date and appointment time are required",
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: "Appointment date must be YYYY-MM-DD",
      });
    }

    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(appointmentTime)) {
      return res.status(400).json({
        success: false,
        message: "Appointment time must be HH:mm",
      });
    }

    // Check clinic
    const clinicExists = await Clinic.findById(clinicId);

    if (!clinicExists) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // Check doctor
    const doctorExists = await Doctor.findById(doctorId);

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Doctor must belong to selected clinic
    if (doctorExists.clinicId.toString() !== clinicId) {
      return res.status(400).json({
        success: false,
        message: "Doctor does not belong to this clinic",
      });
    }

    // Doctor availability
    if (!doctorExists.available) {
      return res.status(400).json({
        success: false,
        message: "Doctor is currently unavailable",
      });
    }

    // Get today's date in Pakistan
    const now = new Date();

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    // Appointment date cannot be before today
    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: "Appointment date cannot be in the past",
      });
    }

    // If appointment is today,
    // appointment time must be in the future
    if (appointmentDate === today) {
      const currentTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);

      if (appointmentTime <= currentTime) {
        return res.status(400).json({
          success: false,
          message: "Appointment time must be in the future",
        });
      }
    }

    // Check duplicate doctor time slot
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: {
        $in: ["PENDING", "CONFIRMED"],
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    // Generate queue number
    const lastAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      status: {
        $in: ["PENDING", "CONFIRMED"],
      },
    }).sort({ queueNumber: -1 });

    const queueNumber = lastAppointment ? lastAppointment.queueNumber + 1 : 1;

    const patient = await User.findById(req.user.userId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user.userId,
      doctorId,
      clinicId,
      appointmentDate,
      appointmentTime,
      reason,
      status: "PENDING",
      queueNumber,
    });

    // Send confirmation email
    try {
      await sendAppointmentConfirmation({
        patientEmail: patient.email,
        patientName: patient.name,
        doctorName: doctorExists.name,
        clinicName: clinicExists.name,
        appointmentDate,
        appointmentTime,
        queueNumber,
      });
    } catch (emailError) {
      console.error("Appointment email failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET APPOINTMENTS
export const getAppointments = async (req, res) => {
  try {
    const filter = {};

    // PATIENT → only their appointments
    if (req.user.role === "PATIENT") {
      filter.patientId = req.user.userId;
    }

    // DOCTOR → only their appointments
    else if (req.user.role === "DOCTOR") {
      filter.doctorId = req.user.doctorId;
    }

    // CLINIC_ADMIN → only their clinic's appointments
    else if (req.user.role === "CLINIC_ADMIN") {
      filter.clinicId = req.user.clinicId;
    }

    // SUPER_ADMIN → no filter → all appointments

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email")
      .populate("doctorId", "name specialization consultationFee")
      .populate("clinicId", "name city address")
      .sort({
        appointmentDate: 1,
        appointmentTime: 1,
      });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET APPOINTMENT BY ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name email")
      .populate("doctorId", "name specialization consultationFee")
      .populate("clinicId", "name city address");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // PATIENT
    if (req.user.role === "PATIENT") {
      if (appointment.patientId.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this appointment",
        });
      }
    }

    // DOCTOR
    else if (req.user.role === "DOCTOR") {
      if (appointment.doctorId.toString() !== req.user.doctorId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this appointment",
        });
      }
    }

    // CLINIC ADMIN
    else if (req.user.role === "CLINIC_ADMIN") {
      if (appointment.clinicId.toString() !== req.user.clinicId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this appointment",
        });
      }
    }

    // SUPER_ADMIN → allowed

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid appointment ID",
    });
  }
};

// UPDATE APPOINTMENT
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const { status } = req.body;

    const allowedStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status",
      });
    }

    // PATIENT
    if (req.user.role === "PATIENT") {
      if (appointment.patientId.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized",
        });
      }

      if (status !== "CANCELLED") {
        return res.status(403).json({
          success: false,
          message: "Patients can only cancel appointments",
        });
      }
    }

    // DOCTOR
    else if (req.user.role === "DOCTOR") {
      if (appointment.doctorId.toString() !== req.user.doctorId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized",
        });
      }
    }

    // CLINIC ADMIN
    else if (req.user.role === "CLINIC_ADMIN") {
      if (appointment.clinicId.toString() !== req.user.clinicId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized",
        });
      }
    }

    // SUPER_ADMIN → allowed

    appointment.status = status;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE APPOINTMENT
export const deleteAppointment = async (req, res) => {
  try {
    if (req.user.role !== "CLINIC_ADMIN" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only clinic admin or super admin can delete appointments",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Clinic admin can only delete appointments
    // belonging to their clinic
    if (req.user.role === "CLINIC_ADMIN") {
      if (appointment.clinicId.toString() !== req.user.clinicId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized",
        });
      }
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid appointment ID",
    });
  }
};
