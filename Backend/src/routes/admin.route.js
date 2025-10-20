import { Router } from "express";
import {
    getDashboardStats,
    getAllUsersWithModelCount,
    toggleUserStatus,
    deleteUser,
    inviteAdminOrEditor,
    inviteUser,
    updateUserByAdminOrEditor,
} from "../controllers/admin.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import verifyAdminOrEditor from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdminOrEditor);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsersWithModelCount);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id", updateUserByAdminOrEditor);

router.post("/invite", inviteAdminOrEditor);
router.post("/invite/user", inviteUser);

export default router;