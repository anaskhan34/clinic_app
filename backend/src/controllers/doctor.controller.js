import { Doctor } from "../models/doctor.model.js";
import { Clinic } from "../models/clinic.model.js";

// CREATE DOCTOR
export const createDoctor = async (req, res) => {
  try {
    const { clinic } = req.body;

    const clinicExists = await Clinic.findById(clinic);

    if (!clinicExists) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // Make sure the logged-in admin owns this clinic
    if (clinicExists.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this clinic",
      });
    }

    const doctor = await Doctor.create(req.body);

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
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
    const doctors = await Doctor.find().populate("clinic", "name city address");

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
      "clinic",
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

    const clinic = await Clinic.findById(doctor.clinic);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    if (clinic.owner.toString() !== req.user.userId) {
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
    ).populate("clinic", "name city address");

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

    const clinic = await Clinic.findById(doctor.clinic);

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
