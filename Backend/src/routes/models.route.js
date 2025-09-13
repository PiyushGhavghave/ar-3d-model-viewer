import { Router } from "express";
import { uploadModel, getUserModels, deleteModel } from "../controllers/models.controllers.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

// All model routes should be protected
router.use(verifyJWT);

router.route("/upload").post(uploadModel);
router.route("/my-models").get(getUserModels);
router.route("/:id").delete(deleteModel);

export default router;