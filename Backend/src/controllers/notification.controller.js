import Notification from '../models/notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import eventEmitter from '../utils/eventEmitter.js';

// @desc    Stream notifications to the admin in real-time
// @route   GET /api/v1/notifications/stream
// @access  Private/Admin
const streamNotifications = asyncHandler(async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendNotification = (notification) => {
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
    };

    // Listen for new notification events
    eventEmitter.on('new_notification', sendNotification);

    req.on('close', () => {
        eventEmitter.removeListener('new_notification', sendNotification);
    });
});


// @desc    Get all notifications and unread count
// @route   GET /api/v1/notifications
// @access  Private/Admin
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json(new apiResponse(200, { notifications, unreadCount }));
});


// @desc    Mark all notifications as read
// @route   POST /api/v1/notifications/mark-read
// @access  Private/Admin
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json(new apiResponse(200, {}, "All notifications marked as read"));
});

export { streamNotifications, getNotifications, markAllAsRead };