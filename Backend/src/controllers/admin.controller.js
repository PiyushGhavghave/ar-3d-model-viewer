import User from "../models/users.model.js";
import Model from "../models/models.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import sendEmail from "../config/sendEmail.js";
import { invitationTemplate } from "../utils/emailTemplate.js";


const getDashboardStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments();
    const modelCount = await Model.countDocuments();

    res.status(200)
    .json(
        new apiResponse(200, { userCount, modelCount }, "Dashboard stats fetched successfully")
    );
});

const getAllUsersWithModelCount = asyncHandler(async (req, res) => {
    const users = await User.aggregate([
        {
            $lookup: {
                from: "models",
                localField: "_id",
                foreignField: "user",
                as: "models"
            }
        },
        {
            $project: {
                username: 1,
                email: 1,
                profilePicture: 1,
                city: 1,
                country: 1,
                isDisabled: 1,
                role: 1,
                lastLogin: 1,
                modelCount: { $size: "$models" }
            }
        }
    ]);

    res.status(200)
    .json(
        new apiResponse(200, users, "Users fetched successfully")
    );
});

const toggleUserStatus = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new apiError(403, "Forbidden: Only admins can enable or disable users.");
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new apiError(404, "User not found");

    user.isDisabled = !user.isDisabled;
    await user.save({ validateBeforeSave: false });

    res.status(200)
    .json(
        new apiResponse(200, { isDisabled: user.isDisabled }, `User has been ${user.isDisabled ? 'disabled' : 'enabled'}`)
    );
});

const deleteUser = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new apiError(403, "Forbidden: Only admins can delete users.");
    }

    const userId = req.params.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find all models of user
    const modelsToDelete = await Model.find({ user: userObjectId });

    // Delete all models of user from Cloudinary
    for (const model of modelsToDelete) {
        if (model.modelPublicId) {
            await deleteFromCloudinary(model.modelPublicId, "raw");
        }
    }
    
    // Delete all models from database
    await Model.deleteMany({ user: userObjectId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json(new apiResponse(200, { id: userId }, "User and all their models have been deleted"));
});

const inviteAdminOrEditor = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new apiError(403, "Forbidden: Only admins can send invites.");
    }

    const { email, role } = req.body;
    if (!email) {
        throw new apiError(400, "Email is required to send an invite");
    }
    if (role !== 'admin' && role !== 'editor') {
        throw new apiError(400, "Invalid role specified. Must be 'admin' or 'editor'.");
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new apiError(400, "A user with this email already exists");
    }

    //create unique username and password from email
    const username = email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);
    const tempPassword = Math.random().toString(36).slice(-8); // generate a random 8 character password

    // Create new user
    const newUser = new User({
        username,
        email,
        password: tempPassword,
        role: role,
    });
    await newUser.save();

    // Send email invitation
    const emailHTML = invitationTemplate(newUser.username, newUser.email, tempPassword, newUser.role);
    await sendEmail({
        to: newUser.email,
        subject: "You're invited to join the admin team",
        html: emailHTML
    });

    res.status(200)
    .json(
        new apiResponse(200, { id: newUser._id }, `${newUser.role} invite sent successfully`)
    );
});


export {
    getDashboardStats,
    getAllUsersWithModelCount,
    toggleUserStatus,
    deleteUser,
    inviteAdminOrEditor
};