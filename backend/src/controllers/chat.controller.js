import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import Chat from '../models/Chat.model.js';
import Listing from '../models/Listing.model.js';

/**
 * @desc    Get all chats for current user
 * @route   GET /api/v1/chats
 * @access  Private
 */
export const getMyChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id,
    status: { $ne: 'blocked' },
  })
    .populate('listing', 'title images phone price status')
    .populate('participants', 'name avatar verified')
    .sort({ 'lastMessage.createdAt': -1 });

  // Add unread count for current user
  const chatsWithUnread = chats.map((chat) => {
    const unreadCount = chat.unreadCount.get(req.user._id.toString()) || 0;
    return {
      ...chat.toObject(),
      unreadCount,
    };
  });

  res.status(200).json({
    status: 'success',
    results: chatsWithUnread.length,
    data: {
      chats: chatsWithUnread,
    },
  });
});

/**
 * @desc    Get chat by ID
 * @route   GET /api/v1/chats/:id
 * @access  Private
 */
export const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate('listing', 'title images phone price status seller')
    .populate('participants', 'name avatar verified')
    .populate('messages.sender', 'name avatar');

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  // Check if user is a participant
  if (!chat.participants.some((p) => p._id.toString() === req.user._id.toString())) {
    throw new AppError('Not authorized to view this chat', 403);
  }

  // Mark messages as read for current user
  await chat.markAsRead(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      chat,
    },
  });
});

/**
 * @desc    Send a message in a chat
 * @route   POST /api/v1/chats/:id/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, type = 'text', metadata } = req.body;

  if (!content) {
    throw new AppError('Message content is required', 400);
  }

  let chat = await Chat.findById(req.params.id);

  // If chat doesn't exist, create it (for new conversations)
  if (!chat && req.body.listingId) {
    const listing = await Listing.findById(req.body.listingId);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    // Create new chat between buyer and seller
    chat = await Chat.create({
      listing: listing._id,
      participants: [req.user._id, listing.seller],
      unreadCount: {
        [req.user._id.toString()]: 0,
        [listing.seller.toString()]: 1,
      },
    });
  }

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  // Check if user is a participant
  if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw new AppError('Not authorized to send messages in this chat', 403);
  }

  // Add message
  await chat.addMessage(req.user._id, content, type, metadata);

  // Emit socket event for real-time update
  const io = req.app.get('io');
  io.to(`chat:${chat._id}`).emit('new-message', {
    chatId: chat._id,
    message: chat.messages[chat.messages.length - 1],
  });

  res.status(201).json({
    status: 'success',
    message: 'Message sent successfully',
    data: {
      message: chat.messages[chat.messages.length - 1],
    },
  });
});

/**
 * @desc    Mark messages as read
 * @route   PUT /api/v1/chats/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  // Check if user is a participant
  if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw new AppError('Not authorized to access this chat', 403);
  }

  await chat.markAsRead(req.user._id);

  // Emit socket event
  const io = req.app.get('io');
  io.to(`chat:${chat._id}`).emit('messages-read', {
    chatId: chat._id,
    userId: req.user._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'Messages marked as read',
  });
});
