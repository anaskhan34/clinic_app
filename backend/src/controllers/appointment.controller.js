import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Clinic } from "../models/clinic.model.js";
import { sendAppointmentConfirmation } from "../services/email.service.js";
import { User } from "../models/user.model.js";
import { getIO } from "../socket/socket.js";

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

    const appointmentDay = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Karachi",
      weekday: "long",
    }).format(new Date(`${appointmentDate}T00:00:00+05:00`));

    const dayKey = appointmentDay.toLowerCase();

    const daySchedule = doctorExists.schedule?.[dayKey];

    if (!daySchedule || !daySchedule.enabled) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${appointmentDay}`,
      });
    }

    if (
      appointmentTime < daySchedule.start ||
      appointmentTime >= daySchedule.end
    ) {
      return res.status(400).json({
        success: false,
        message: `Doctor is available from ${daySchedule.start} to ${daySchedule.end}`,
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

    const io = getIO();

    io.to(`queue:${doctorId}:${appointmentDate}`).emit("queueUpdated", {
      doctorId,
      clinicId,
      date: appointmentDate,
      queueNumber,
      appointmentId: appointment._id,
      status: appointment.status,
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
    let filter = {};

    if (req.user.role === "PATIENT") {
      filter.patientId = req.user.userId;
    }

    if (req.user.role === "DOCTOR") {
      filter.doctorId = req.user.doctorId;
    }

    if (req.user.role === "CLINIC_ADMIN") {
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
    const appointment = await Appointment.findById(req.params.id);

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

    // Populate AFTER authorization
    await appointment.populate([
      {
        path: "patientId",
        select: "name email",
      },
      {
        path: "doctorId",
        select: "name specialization consultationFee",
      },
      {
        path: "clinicId",
        select: "name city address",
      },
    ]);

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

    const allowedStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status",
      });
    }

    // Prevent changing a completed/cancelled appointment
    if (
      appointment.status === "COMPLETED" ||
      appointment.status === "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot update an appointment that is already ${appointment.status.toLowerCase()}`,
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

    const io = getIO();
    // socket io
    io.to(`queue:${appointment.doctorId}:${appointment.appointmentDate}`).emit(
      "queueUpdated",
      {
        doctorId: appointment.doctorId,
        clinicId: appointment.clinicId,
        date: appointment.appointmentDate,
        appointmentId: appointment._id,
        queueNumber: appointment.queueNumber,
        status: appointment.status,
      },
    );

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

// GET AVAILABLE TIME SLOTS
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "doctorId and date are required",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctor.available) {
      return res.status(400).json({
        success: false,
        message: "Doctor is currently unavailable",
      });
    }

    const selectedDate = new Date(`${date}T00:00:00`);

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const dayName = dayNames[selectedDate.getDay()];

    const schedule = doctor.schedule?.[dayName];

    if (!schedule || !schedule.enabled) {
      return res.status(200).json({
        success: true,
        data: {
          date,
          doctorId,
          bookedSlots: [],
          availableSlots: [],
          message: "Doctor is not available on this day",
        },
      });
    }

    const slots = [];

    let [startHour, startMinute] = schedule.start.split(":").map(Number);
    const [endHour, endMinute] = schedule.end.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // 30-minute slots
    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;

      slots.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      );

      currentMinutes += 30;
    }

    // Get booked appointments
    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: date,
      status: {
        $in: ["PENDING", "CONFIRMED"],
      },
    }).select("appointmentTime");

    const bookedSlots = appointments.map(
      (appointment) => appointment.appointmentTime,
    );

    const availableSlots = slots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        date,
        doctorId,
        day: dayName,
        workingHours: {
          start: schedule.start,
          end: schedule.end,
        },
        bookedSlots,
        availableSlots,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET TODAY/DATE QUEUE
export const getDoctorQueue = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date is required",
      });
    }

    if (!req.user.doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile is not assigned",
      });
    }

    const appointments = await Appointment.find({
      doctorId: req.user.doctorId,
      appointmentDate: date,
      status: {
        $in: ["PENDING", "CONFIRMED"],
      },
    })
      .populate("patientId", "name email")
      .populate("clinicId", "name city address")
      .sort({ queueNumber: 1 });

    res.status(200).json({
      success: true,
      data: {
        date,
        doctorId: req.user.doctorId,
        currentQueue: appointments.length ? appointments[0].queueNumber : null,
        appointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CURRENT QUEUE
export const getQueue = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "doctorId and date are required",
      });
    }

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: date,
      status: {
        $in: ["PENDING", "CONFIRMED"],
      },
    })
      .populate("patientId", "name email")
      .sort({ queueNumber: 1 });

    res.status(200).json({
      success: true,
      data: {
        doctorId,
        date,
        currentQueue: appointments.length ? appointments[0].queueNumber : null,
        appointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
