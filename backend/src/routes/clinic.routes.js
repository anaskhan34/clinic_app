import { Router } from "express";
import * as clinicDataController from "../controllers/clinic.controller.js";
import { authorize } from "../middleware/role.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// ====================
// PUBLIC
// ====================

// Get all clinics
router.get(
  "/",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  clinicDataController.getClinicData,
);

// ====================
// CLINIC ADMIN
// ====================

// Get my clinic
router.get(
  "/my-clinic",
  protect,
  authorize("CLINIC_ADMIN"),
  clinicDataController.getMyClinic,
);

// Get clinic by ID
router.get(
  "/:id",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  clinicDataController.getClinicById,
);

// Create clinic
router.post(
  "/",
  protect,
  authorize("CLINIC_ADMIN"),
  clinicDataController.createClinic,
);

// Update clinic
router.put(
  "/:id",
  protect,
  authorize("CLINIC_ADMIN"),
  clinicDataController.updateClinic,
);

// Delete clinic
router.delete(
  "/:id",
  protect,
  authorize("CLINIC_ADMIN"),
  clinicDataController.deleteClinic,
);

export const clinicRouter = router;
