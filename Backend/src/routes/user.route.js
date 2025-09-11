import { Router } from "express";
import { getUser } from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { updateUserProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/get-user", verifyJWT, getUser);
router.put("/update-profile", verifyJWT, updateUserProfile);

export default router;