import mongoose from "mongoose";

const modelSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    modelUrl: {
        type: String,
        required: [true, 'Model URL is required']
    },
    modelPublicId: { // To store the ID for Cloudinary deletion
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String, 
        required: [true, 'Thumbnail URL is required']
    }
}, { timestamps: true });

const Model = mongoose.model('Model', modelSchema);
export default Model;