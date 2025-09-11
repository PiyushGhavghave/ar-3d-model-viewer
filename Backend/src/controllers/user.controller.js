import User from "../models/users.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new apiError(404, "User not found");
    }
    return res.status(200).json(
        new apiResponse(200, { user }, "User retrieved successfully")
    );
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const { username, profilePicture, city, country } = req.body;
    const userId = req?.user?._id;

    const user = await User.findById(userId);
    if (!user) {
        throw new apiError(404, "User not found");
    }

    // Update fields if they are provided
    if (username) user.username = username;
    if (profilePicture) user.profilePicture = profilePicture;
    if (city) user.city = city;
    if (country) user.country = country;

    const updatedUser = await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new apiResponse(200, { user: updatedUser }, "Profile updated successfully")
    );
});

export { getUser, updateUserProfile };