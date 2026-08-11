import { Router } from "express";
import * as clinicDataController from "../controllers/clinic.controller.js";
import { authorize } from "../middleware/role.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// GET all clinics
router.get("/", clinicDataController.getClinicData);

// GET clinic by ID
router.get("/:id", clinicDataController.getClinicById);

// CREATE clinic
router.post(
  "/",
  protect,
  authorize("CLINIC_ADMIN"),
  clinicDataController.createClinic,
);

// UPDATE clinic
router.put(
  "/:id",
  protect,
  authorize("CLINIC_ADMIN"),
  clinicDataController.updateClinic,
);

// DELETE clinic
router.delete(
  "/:id",
  protect,
  authorize("CLINIC_ADMIN"),
  clinicDataController.deleteClinic,
);

export const clinicRouter = router;
