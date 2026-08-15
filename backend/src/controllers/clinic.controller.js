import { Clinic } from "../models/clinic.model.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

// createClinic
export const createClinic = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Required fields
    if (!name || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }

    console.log("cliid", req.user.clinicId);

    // Prevent admin from creating multiple clinics
    if (req.user.clinicId) {
      return res.status(400).json({
        success: false,
        message: "You already have a clinic",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if clinic already exists
    const existingClinic = await Clinic.findOne({
      email: normalizedEmail,
    });

    if (existingClinic) {
      return res.status(409).json({
        success: false,
        message: "A clinic with this email already exists",
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
    let filter = {};
    console.log("get clinic data line 90", req.user.role);
    console.log("get clinic data line 91", filter);

    // Clinic admin → only their clinic
    if (req.user.role === "CLINIC_ADMIN") {
      filter.ownerId = req.user.userId;
    }

    // SUPER_ADMIN → all clinics
    const clinics = await Clinic.find(filter);

    if (!clinics) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

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

    // Clinic admin can only access their own clinic
    if (
      req.user.role === "CLINIC_ADMIN" &&
      clinic.ownerId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this clinic",
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
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // CLINIC_ADMIN can only update their own clinic
    if (req.user.role === "CLINIC_ADMIN") {
      if (clinic.ownerId.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this clinic",
        });
      }
    }

    const updatedClinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Clinic updated successfully",
      data: updatedClinic,
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
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // Clinic Admin can only delete their own clinic
    if (req.user.role === "CLINIC_ADMIN") {
      if (clinic.ownerId.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this clinic",
        });
      }
    }

    // Remove clinic reference from admin
    const updatedUser = await User.findOneAndUpdate(
      {
        clinicId: clinic._id,
      },
      {
        $set: {
          clinicId: null,
        },
      },
      {
        new: true, //give the latest data
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Clinic admin not found",
      });
    }

    console.log("UPDATED USER AFTER DELETE:", {
      id: updatedUser._id,
      clinicId: updatedUser.clinicId,
    });

    // Delete clinic
    await clinic.deleteOne();

    // Generate new JWT with clinicId = null
    const token = generateToken(updatedUser);

    // Replace old JWT cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Clinic deleted successfully",
    });
  } catch (error) {
    console.error("Delete clinic error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// getMyClinic API controller for only clinic admin
export const getMyClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findOne({
      ownerId: req.user.userId,
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "You don't have a clinic",
      });
    }

    res.status(200).json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
