import { Router } from "express";

import * as doctorController from "../controllers/doctor.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// GET all doctors
router.get(
  "/",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  doctorController.getDoctors,
);

// GET doctor by ID
router.get(
  "/:id",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  doctorController.getDoctorById,
);

// CREATE doctor
router.post(
  "/",
  protect,
  authorize("CLINIC_ADMIN"),
  upload.single("image"),
  doctorController.createDoctor,
);

// UPDATE doctor
router.put(
  "/:id",
  protect,
  authorize("DOCTOR", "CLINIC_ADMIN"),
  upload.single("image"),
  doctorController.updateDoctor,
);

// DELETE doctor
router.delete(
  "/:id",
  protect,
  authorize("CLINIC_ADMIN"),
  doctorController.deleteDoctor,
);

export const doctorRouter = router;
