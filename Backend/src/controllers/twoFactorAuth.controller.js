import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { apiError } from '../utils/apiError.js';
import User from '../models/users.model.js';

const generateTwoFactorSecret = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user){
        throw new apiError(404, "User not found");
    }

    // Generate a new secret
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'AR 3D Model Viewer', secret);

    user.twoFactorSecret = secret;
    await user.save({ validateBeforeSave: false });

    // Generate QR code data URL
    const qrCodeDataURL = await qrcode.toDataURL(otpauth);

    res.status(200)
    .json(
        new apiResponse(200, { secret, qrCodeDataURL }, "2FA secret generated")
    );
});

const verifyAndEnableTwoFactor = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token){
        throw new apiError(400, "Token is required");
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.twoFactorSecret) {
        throw new apiError(400, "2FA secret not found or not generated yet");
    }

    // Verify the token
    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
        throw new apiError(400, "Invalid 2FA token");
    }

    user.isTwoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });

    res.status(200)
    .json(
        new apiResponse(200, {}, "2FA has been enabled successfully")
    );
});

const disableTwoFactor = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token){
        throw new apiError(400, "Token is required to disable 2FA");
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.twoFactorSecret) {
        throw new apiError(400, "2FA secret not found or not generated yet");
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
        throw new apiError(400, "Invalid 2FA token");
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = ''; // Clear the secret
    await user.save({ validateBeforeSave: false });

    res.status(200)
    .json(
        new apiResponse(200, {}, "2FA has been disabled")
    );
});

export {generateTwoFactorSecret, verifyAndEnableTwoFactor, disableTwoFactor};