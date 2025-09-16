import { Router } from "express";
import { uploadModel, getUserModels, deleteModel, getModelById } from "../controllers/models.controllers.js";
import verifyJWT from "../middlewares/auth.middleware.js";


const router = Router();


router.post("/upload", verifyJWT, uploadModel);
router.get("/my-models", verifyJWT, getUserModels);
router.delete("/:id", verifyJWT, deleteModel);

router.get("/:id", getModelById);

export default router;