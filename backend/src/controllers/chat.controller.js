import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import Chat from '../models/Chat.model.js';
import Listing from '../models/Listing.model.js';

/**
 * @desc    Get total unread count for current user
 * @route   GET /api/v1/chats/unread-count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id,
  });

  let totalUnread = 0;
  chats.forEach((chat) => {
    const count = chat.unreadCount.get(req.user._id.toString()) || 0;
    totalUnread += count;
  });

  res.status(200).json({
    status: 'success',
    data: {
      unreadCount: totalUnread,
    },
  });
});

/**
 * @desc    Create or get existing chat for a listing
 * @route   POST /api/v1/chats
 * @access  Private
 */
export const createOrGetChat = asyncHandler(async (req, res) => {
  const { listingId } = req.body;

  if (!listingId) {
    throw new AppError('Listing ID is required', 400);
  }

  // Find the listing
  const listing = await Listing.findById(listingId).populate('seller', 'name email');
  
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Check if listing is active
  if (listing.status !== 'active') {
    throw new AppError('Cannot chat about inactive listings', 400);
  }

  // Prevent seller from chatting with themselves
  if (listing.seller._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot chat about your own listing', 400);
  }

  // Check if chat already exists between these users for this listing
  let chat = await Chat.findOne({
    listing: listingId,
    participants: { $all: [req.user._id, listing.seller._id] },
  })
    .populate('listing', 'title images phone price status')
    .populate('participants', 'name avatar verified');

  // If chat doesn't exist, create it
  if (!chat) {
    chat = await Chat.create({
      listing: listingId,
      participants: [req.user._id, listing.seller._id],
      unreadCount: new Map([
        [req.user._id.toString(), 0],
        [listing.seller._id.toString(), 0],
      ]),
    });

    // Populate the newly created chat
    chat = await Chat.findById(chat._id)
      .populate('listing', 'title images phone price status')
      .populate('participants', 'name avatar verified');
  }

  res.status(201).json({
    status: 'success',
    data: {
      chat,
    },
  });
});

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

  // Convert unreadCount Map to plain object for JSON serialization
  const chatsWithUnread = chats.map((chat) => {
    const chatObj = chat.toObject();
    // Convert Map to plain object
    const unreadCountObj = {};
    if (chat.unreadCount) {
      chat.unreadCount.forEach((value, key) => {
        unreadCountObj[key] = value;
      });
    }
    return {
      ...chatObj,
      unreadCount: unreadCountObj,
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

  // Reload chat to get populated message
  await chat.populate('messages.sender', 'name email profilePicture');
  const lastMessage = chat.messages[chat.messages.length - 1];

  // Create message object with chat ID for socket emission
  const messageWithChat = {
    _id: lastMessage._id,
    chat: chat._id.toString(),
    sender: lastMessage.sender,
    content: lastMessage.content,
    type: lastMessage.type,
    metadata: lastMessage.metadata,
    readBy: lastMessage.readBy,
    createdAt: lastMessage.createdAt,
    updatedAt: lastMessage.updatedAt,
  };

  // Emit socket event for real-time update
  const io = req.app.get('io');
  const userSockets = req.app.get('userSockets');
  
  // Emit to chat room (users currently in chat)
  io.to(`chat:${chat._id}`).emit('new-message', messageWithChat);
  
  // Also emit to all participants individually (for notifications)
  chat.participants.forEach((participantId) => {
    const socketId = userSockets.get(participantId.toString());
    if (socketId) {
      io.to(socketId).emit('new-message', messageWithChat);
    }
  });

  res.status(201).json({
    status: 'success',
    message: 'Message sent successfully',
    data: {
      message: lastMessage,
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
  const userSockets = req.app.get('userSockets');
  
  // Emit to chat room (users currently in chat)
  io.to(`chat:${chat._id}`).emit('messages-read', {
    chatId: chat._id.toString(),
    userId: req.user._id.toString(),
  });
  
  // Also emit to all participants individually (for badge updates when not in chat)
  chat.participants.forEach((participantId) => {
    const socketId = userSockets.get(participantId.toString());
    if (socketId) {
      io.to(socketId).emit('messages-read', {
        chatId: chat._id.toString(),
        userId: req.user._id.toString(),
      });
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Messages marked as read',
  });
});
