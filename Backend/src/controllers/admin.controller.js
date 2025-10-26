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

const getMonthlyActiveUsers = asyncHandler(async (req, res) => {
    const today = new Date();
    const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    const data = await User.aggregate([
        {
            $match: {
                $and: [
                    { lastLogin: { $gte: twelveMonthsAgo } },
                    { role: { $ne: 'admin' } }
                ]
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$lastLogin" },
                    month: { $month: "$lastLogin" }
                },
                users: { $addToSet: "$_id" }
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                count: { $size: "$users" }
            }
        },
        {
            $sort: { year: 1, month: 1 }
        }
    ]);

    res.status(200)
    .json(
        new apiResponse(200, data, "Monthly active user data fetched successfully")
    );
});

const getAllUsersWithModelCount = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.aggregate([
        {
            $match: { role: { $ne: 'admin' } }
        },
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
        },
        { $sort: { createdAt: -1 } }, // Sort before skipping/limiting
        { $skip: skip },
        { $limit: limit }
    ]);

    res.status(200)
    .json(
        new apiResponse(200, {
            users,
            totalPages,
            currentPage: page,
            totalUsers
        }, "Users fetched successfully")
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

const inviteUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new apiError(400, "Email is required to send an invite");
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
        role: 'user',
    });
    await newUser.save();

    // Send email invitation
    const emailHTML = invitationTemplate(newUser.username, newUser.email, tempPassword, newUser.role);
    await sendEmail({
        to: newUser.email,
        subject: "You're invited to join!",
        html: emailHTML
    });

    res.status(200)
    .json(
        new apiResponse(200, { id: newUser._id }, "User invite sent successfully")
    );
});

const updateUserByAdminOrEditor = asyncHandler(async (req, res) => {
    const { username, password, profilePicture, city, country } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        throw new apiError(404, "User not found");
    }

    if (username) user.username = username;
    if (profilePicture) user.profilePicture = profilePicture;
    if (city) user.city = city;
    if (country) user.country = country;
    
    if (password) {
        user.password = password;
    }

    await user.save();

    res.status(200)
    .json(
        new apiResponse(200, { id: user._id, username: user.username }, "User updated successfully")
    );
});

export {
    getDashboardStats,
    getAllUsersWithModelCount,
    toggleUserStatus,
    deleteUser,
    inviteAdminOrEditor,
    inviteUser,
    updateUserByAdminOrEditor,
    getMonthlyActiveUsers,
};