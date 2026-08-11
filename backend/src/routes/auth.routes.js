import { Router } from "express";
import * as AuthUser from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", AuthUser.register);
router.post("/login", AuthUser.login);
export default router;
