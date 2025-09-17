import { Router } from "express";
import { generateTwoFactorSecret, verifyAndEnableTwoFactor, disableTwoFactor } from "../controllers/twoFactorAuth.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

// All routes here require the user to be logged in
router.use(verifyJWT);

router.post("/generate", generateTwoFactorSecret);
router.post("/verify", verifyAndEnableTwoFactor);
router.post("/disable", disableTwoFactor);

export default router;