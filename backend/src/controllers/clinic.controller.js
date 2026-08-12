import { Clinic } from "../models/clinic.model.js";

// CREATE
export const createClinic = async (req, res) => {
  try {
    const clinic = await Clinic.create({
      ...req.body,
      owner: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Clinic created successfully",
      data: clinic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// READ ALL
export const getClinicData = async (req, res) => {
  try {
    const clinics = await Clinic.find();

    res.status(200).json({
      success: true,
      count: clinics.length,
      data: clinics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// READ ONE
export const getClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    res.status(200).json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid clinic ID",
    });
  }
};

// UPDATE
export const updateClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Clinic updated successfully",
      data: clinic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
export const deleteClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndDelete(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Clinic deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid clinic ID",
    });
  }
};
