import { Clinic } from "../models/clinic.model.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

// createClinic
export const createClinic = async (req, res) => {
  try {
    // Prevent admin from creating multiple clinics
    if (req.user.clinicId) {
      return res.status(400).json({
        success: false,
        message: "You already have a clinic",
      });
    }

    // Create clinic
    const clinic = await Clinic.create({
      ...req.body,
      ownerId: req.user.userId,
    });

    // Assign newly created clinic to the admin
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        clinicId: clinic._id,
      },
      {
        new: true,
      },
    );

    if (!updatedUser) {
      // Safety: remove clinic if admin doesn't exist
      await Clinic.findByIdAndDelete(clinic._id);

      return res.status(404).json({
        success: false,
        message: "Clinic admin not found",
      });
    }

    console.log("UPDATED USER:", {
      id: updatedUser._id,
      clinicId: updatedUser.clinicId,
    });

    // Generate new JWT with clinicId
    const token = generateToken({
      userId: updatedUser._id,
      role: updatedUser.role,
      doctorId: updatedUser.doctorId || null,
      clinicId: updatedUser.clinicId,
    });

    // Replace old JWT cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Clinic created and assigned successfully",
      data: {
        clinic,
        admin: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          clinicId: updatedUser.clinicId,
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
    const clinic = await Clinic.findOneAndUpdate(
      {
        _id: req.params.id,
        ownerId: req.user.userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found or you are not authorized",
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
    const clinic = await Clinic.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user.userId,
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found or you are not authorized",
      });
    }

    // Remove clinic reference from admin
    await User.findByIdAndUpdate(req.user.userId, {
      clinicId: null,
    });

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
