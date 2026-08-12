import { Router } from "express";
import * as AuthUser from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post("/register", AuthUser.register);
router.post("/login", AuthUser.login);
router.get("/me", protect, AuthUser.getMe);
router.post("/logout", AuthUser.logout);

// SUPER ADMIN ONLY
router.post(
  "/create-clinic-admin",
  protect,
  authorize("SUPER_ADMIN"),
  AuthUser.createClinicAdminController,
);

export default router;
