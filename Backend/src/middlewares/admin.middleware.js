import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyAdminOrEditor = asyncHandler(async (req, _, next) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'editor') {
        throw new apiError(403, "Forbidden: You are not authorized to perform this action.");
    }
    next();
});

export default verifyAdminOrEditor;