import { Doctor } from "../models/doctor.model.js";
import { Clinic } from "../models/clinic.model.js";
import { User } from "../models/user.model.js";
import { hashedPassword } from "../validations/password-validations.js";

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
      image,
    } = req.body;

    if (!name || !email || !specialization) {
      return res.status(400).json({
        success: false,
        message: "Name, email and specialization are required",
      });
    }

    console.log(req.user);

    // Clinic Admin must have a clinic
    if (!req.user.clinicId) {
      return res.status(400).json({
        success: false,
        message: "You don't have a clinic assigned",
      });
    }

    // Check if doctor email already exists
    const existingDoctor = await Doctor.findOne({ email });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    // Create doctor using admin's clinic
    const doctor = await Doctor.create({
      name,
      email,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      image,
      clinicId: req.user.clinicId,
    });
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
    const doctors = await Doctor.find().populate(
      "clinicId",
      "name city address",
    );

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

    const clinic = await Clinic.findById(doctor.clinicId);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    if (clinic.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this doctor",
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    ).populate("clinicId", "name city address");

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
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

    const clinic = await Clinic.findById(doctor.clinicId);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    if (clinic.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this doctor",
      });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid doctor ID",
    });
  }
};
