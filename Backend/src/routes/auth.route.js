import { Router } from "express";
import { signup , verifyEmail, login, logout, sendChangePasswordCode, resetPassword} from "../controllers/auth.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);

router.post("/logout", verifyJWT, logout);
router.post("/send-change-password-code", verifyJWT, sendChangePasswordCode);
router.post("/reset-password", verifyJWT, resetPassword);

export default router;
