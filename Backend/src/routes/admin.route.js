import { Router } from "express";
import {
    getDashboardStats,
    getAllUsersWithModelCount,
    toggleUserStatus,
    deleteUser,
    inviteAdminOrEditor
} from "../controllers/admin.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import verifyAdminOrEditor from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdminOrEditor);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsersWithModelCount);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

router.post("/invite", inviteAdminOrEditor)

export default router;