import { Router } from "express";
import {
    getDashboardStats,
    getAllUsersWithModelCount,
    toggleUserStatus,
    deleteUser
} from "../controllers/admin.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import verifyAdmin from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsersWithModelCount);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

export default router;