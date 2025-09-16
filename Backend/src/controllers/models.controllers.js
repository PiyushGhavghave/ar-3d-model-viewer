import Model from "../models/models.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const uploadModel = asyncHandler(async (req, res) => {
    // The frontend will now provide the auto-generated thumbnailUrl
    const { title, description, modelUrl, modelPublicId, thumbnailUrl } = req.body;

    if (!title || !modelUrl || !modelPublicId || !thumbnailUrl) {
        throw new apiError(400, "All fields are required to upload a model");
    }

    const model = await Model.create({
        user: req.user._id,
        title,
        description,
        modelUrl,
        modelPublicId,
        thumbnailUrl
    });

    return res.status(201)
    .json(
        new apiResponse(201, model, "Model uploaded successfully")
    );
});

const getUserModels = asyncHandler(async (req, res) => {
    const models = await Model.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200)
    .json(
        new apiResponse(200, models, "Your models fetched successfully")
    );
});

const deleteModel = asyncHandler(async (req, res) => {
    const model = await Model.findById(req.params.id);

    if (!model) {
        throw new apiError(404, "Model not found");
    }

    if (model.user.toString() !== req.user._id.toString()) {
        throw new apiError(401, "You are not authorized to delete this model");
    }

    // thumbnail is derived from the model, we only need to delete the raw model file.
    await deleteFromCloudinary(model.modelPublicId, "raw"); 

    await model.deleteOne();

    return res.status(200).json(new apiResponse(200, { id: req.params.id }, "Model deleted successfully"));
});

const getModelById = asyncHandler(async (req, res) => {
    const model = await Model.findById(req.params.id);

    if (!model) {
        throw new apiError(404, "Model not found");
    }

    return res.status(200).json(new apiResponse(200, model, "Model fetched successfully"));
});

export { uploadModel, getUserModels, deleteModel, getModelById };