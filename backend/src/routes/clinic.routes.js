import { Router } from "express";
import * as clinicDataController from "../controllers/clinic.controller.js";

const router = Router();

// GET all clinics
router.get("/", clinicDataController.getClinicData);

// GET clinic by ID
router.get("/:id", clinicDataController.getClinicById);

// CREATE clinic
router.post("/", clinicDataController.createClinic);

// UPDATE clinic
router.put("/:id", clinicDataController.updateClinic);

// DELETE clinic
router.delete("/:id", clinicDataController.deleteClinic);

export const clinicRouter = router;
