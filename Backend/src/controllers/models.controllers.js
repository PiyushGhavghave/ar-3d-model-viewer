import Model from "../models/models.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";


const uploadModel = asyncHandler(async (req, res) => {
    const { title, description, modelUrl, modelPublicId, thumbnailUrl, thumbnailPublicId } = req.body;

    if (!title || !modelUrl || !modelPublicId || !thumbnailUrl || !thumbnailPublicId) {
        throw new apiError(400, "All fields are required to upload a model");
    }

    const model = await Model.create({
        user: req.user._id,
        title,
        description,
        modelUrl,
        modelPublicId,
        thumbnailUrl,
        thumbnailPublicId
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
    const modelId = req.params.id;
    if(!modelId){
        throw new apiError(400, "Model ID is required");
    }

    const model = await Model.findById(modelId);
    if (!model) {
        throw new apiError(404, "Model not found");
    }

    // Ensure the user owns the model
    if (model.user.toString() !== req.user._id.toString()) {
        throw new apiError(401, "You are not authorized to delete this model");
    }

    // Delete model and thumbnail from Cloudinary
    await deleteFromCloudinary(model.modelPublicId, "raw"); // 3D models are often stored as 'raw' files
    await deleteFromCloudinary(model.thumbnailPublicId, "image");

    // Delete the model from the database
    await model.deleteOne();

    return res.status(200).json(new apiResponse(200, { id: req.params.id }, "Model deleted successfully"));
});

export { uploadModel, getUserModels, deleteModel };