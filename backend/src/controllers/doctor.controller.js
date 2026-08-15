import { Doctor } from "../models/doctor.model.js";
import { Clinic } from "../models/clinic.model.js";
import { User } from "../models/user.model.js";
import { hashedPassword } from "../validations/password-validations.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";
// CREATE DOCTOR
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      specialization,
      qualification,
      experience,
      consultationFee,
    } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and specialization are required",
      });
    }

    // Clinic Admin must have a clinic
    if (!req.user.clinicId) {
      return res.status(400).json({
        success: false,
        message: "You don't have a clinic assigned",
      });
    }

    // Check duplicate doctor
    const existingDoctor = await Doctor.findOne({ email });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    // Upload image if provided
    let image = "";
    let imagePublicId = "";

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "clinicflow/doctors",
      );

      image = result.secure_url;
      imagePublicId = result.public_id;
    }

    // Create doctor
    const doctor = await Doctor.create({
      name,
      email,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      image,
      imagePublicId,
      clinicId: req.user.clinicId,
    });

    // Hash password
    const hashed = await hashedPassword(password);

    // Create doctor login account
    const doctorUser = await User.create({
      name,
      email,
      password: hashed,
      role: "DOCTOR",
      doctorId: doctor._id,
      clinicId: req.user.clinicId,
    });

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: {
        doctor,
        user: {
          id: doctorUser._id,
          name: doctorUser.name,
          email: doctorUser.email,
          role: doctorUser.role,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL DOCTORS
export const getDoctors = async (req, res) => {
  try {
    const { clinicId, specialization, available } = req.query;

    const filter = {};

    if (clinicId) {
      filter.clinicId = clinicId;
    }

    if (specialization) {
      filter.specialization = specialization;
    }

    if (available !== undefined) {
      filter.available = available === "true";
    }

    // Clinic admin can only see doctors of their clinic
    if (req.user.role === "CLINIC_ADMIN") {
      filter.clinicId = req.user.clinicId;
    }

    // Doctor only sees himself
    if (req.user.role === "DOCTOR") {
      filter._id = req.user.doctorId;
    }

    const doctors = await Doctor.find(filter)
      .populate("clinicId", "name city address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET DOCTOR BY ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "clinicId",
      "name city address",
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid doctor ID",
    });
  }
};

// UPDATE DOCTOR
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // DOCTOR can update only himself
    if (req.user.role === "DOCTOR") {
      if (doctor._id.toString() !== req.user.doctorId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this doctor",
        });
      }
    }

    // CLINIC_ADMIN can update only doctors in their clinic
    if (req.user.role === "CLINIC_ADMIN") {
      if (doctor.clinicId.toString() !== req.user.clinicId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this doctor",
        });
      }
    }

    // Always make sure body exists
    const updateData = req.body || {};

    // These fields cannot be changed
    delete updateData.clinicId;
    delete updateData.image;
    delete updateData.imagePublicId;

    // ============================
    // UPDATE IMAGE
    // ============================

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "clinicflow/doctors",
      );

      // Delete old Cloudinary image
      if (doctor.imagePublicId) {
        await deleteFromCloudinary(doctor.imagePublicId);
      }

      // Save NEW image information
      doctor.image = result.secure_url;
      doctor.imagePublicId = result.public_id;
    }

    // ============================
    // UPDATE OTHER FIELDS
    // ============================

    Object.assign(doctor, updateData);

    await doctor.save();

    // Populate clinic after saving
    await doctor.populate("clinicId", "name city address");

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("UPDATE DOCTOR ERROR:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE DOCTOR
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Clinic admin can delete only doctors in their clinic
    if (req.user.role === "CLINIC_ADMIN") {
      if (doctor.clinicId.toString() !== req.user.clinicId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this doctor",
        });
      }
    }

    // Delete image from Cloudinary
    if (doctor.imagePublicId) {
      await deleteFromCloudinary(doctor.imagePublicId);
    }

    // Delete doctor
    await Doctor.findByIdAndDelete(req.params.id);

    // Delete doctor's login account
    await User.findOneAndDelete({
      doctorId: doctor._id,
    });

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
