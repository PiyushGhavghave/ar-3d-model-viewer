import { Router } from "express";
import { streamNotifications, getNotifications, markAllAsRead } from "../controllers/notification.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import verifyAdminOrEditor from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdminOrEditor);

router.get("/stream", streamNotifications);
router.get("/", getNotifications);
router.post("/mark-read", markAllAsRead);

export default router;