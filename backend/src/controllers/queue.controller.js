import { Appointment } from "../models/appointment.model.js";

// getDoctorQueue
export const getDoctorQueue = async (req, res) => {
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
        $in: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
      },
    })
      .populate("patientId", "name email")
      .sort({ queueNumber: 1 });

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

// updateQueueStatus
export const updateQueueStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid queue status",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Doctor can only manage his own queue
    if (req.user.role === "DOCTOR") {
      if (appointment.doctorId.toString() !== req.user.doctorId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized",
        });
      }
    }

    // Clinic admin can manage appointments in their clinic
    if (req.user.role === "CLINIC_ADMIN") {
      if (appointment.clinicId.toString() !== req.user.clinicId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized",
        });
      }
    }

    appointment.status = status;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Queue status updated successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
