import { Router } from "express";
import {
  getDoctorQueue,
  updateQueueStatus,
} from "../controllers/queue.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get(
  "/",
  protect,
  authorize("DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  getDoctorQueue,
);

router.patch(
  "/:appointmentId/status",
  protect,
  authorize("DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  updateQueueStatus,
);

export default router;
