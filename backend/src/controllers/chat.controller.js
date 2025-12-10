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

/**
 * @desc    Send price offer in chat
 * @route   POST /api/v1/chats/:id/offer
 * @access  Private
 */
export const sendOffer = asyncHandler(async (req, res) => {
  const { offerPrice, message } = req.body;

  if (!offerPrice || offerPrice <= 0) {
    throw new AppError('Valid offer price is required', 400);
  }

  const chat = await Chat.findById(req.params.id).populate('listing', 'title price seller');

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  // Check if user is a participant
  if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw new AppError('Not authorized to access this chat', 403);
  }

  // Create offer message
  const offerMessage = {
    sender: req.user._id,
    content: message || `Offering ${offerPrice} for ${chat.listing.title}`,
    type: 'offer',
    metadata: {
      offerPrice,
      offerStatus: 'pending',
    },
    readBy: [
      {
        user: req.user._id,
        readAt: new Date(),
      },
    ],
    createdAt: new Date(),
  };

  chat.messages.push(offerMessage);

  // Update last message
  chat.lastMessage = {
    content: offerMessage.content,
    sender: req.user._id,
    createdAt: offerMessage.createdAt,
  };

  // Increment unread count for other participant
  chat.participants.forEach((participantId) => {
    if (participantId.toString() !== req.user._id.toString()) {
      const currentCount = chat.unreadCount.get(participantId.toString()) || 0;
      chat.unreadCount.set(participantId.toString(), currentCount + 1);
    }
  });

  await chat.save();

  // Populate the new message
  await chat.populate('messages.sender', 'name avatar');
  const newMessage = chat.messages[chat.messages.length - 1];

  // Emit socket event
  const io = req.app.get('io');
  io.to(`chat:${chat._id}`).emit('new-message', {
    ...newMessage.toObject(),
    chat: chat._id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      message: newMessage,
    },
  });
});

/**
 * @desc    Respond to price offer (accept/reject)
 * @route   PATCH /api/v1/chats/:chatId/offer/:messageId
 * @access  Private
 */
export const respondToOffer = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;
  const { status, counterOffer } = req.body;

  if (!['accepted', 'rejected', 'countered'].includes(status)) {
    throw new AppError('Invalid response status', 400);
  }

  if (status === 'countered' && (!counterOffer || counterOffer <= 0)) {
    throw new AppError('Valid counter offer is required', 400);
  }

  const chat = await Chat.findById(chatId).populate('listing', 'title seller');

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  // Check if user is a participant
  if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw new AppError('Not authorized to access this chat', 403);
  }

  // Find the offer message
  const offerMessage = chat.messages.id(messageId);

  if (!offerMessage) {
    throw new AppError('Offer message not found', 404);
  }

  if (offerMessage.type !== 'offer') {
    throw new AppError('This is not an offer message', 400);
  }

  // Can't respond to your own offer
  if (offerMessage.sender.toString() === req.user._id.toString()) {
    throw new AppError('Cannot respond to your own offer', 400);
  }

  // Can't respond to already responded offer
  if (offerMessage.metadata.offerStatus !== 'pending') {
    throw new AppError('This offer has already been responded to', 400);
  }

  // Update offer status
  offerMessage.metadata.offerStatus = status;

  // Add system message about the response
  let systemMessage;
  if (status === 'accepted') {
    systemMessage = {
      sender: req.user._id,
      content: `Accepted offer of ${offerMessage.metadata.offerPrice}`,
      type: 'system',
      readBy: [{ user: req.user._id, readAt: new Date() }],
      createdAt: new Date(),
    };
  } else if (status === 'rejected') {
    systemMessage = {
      sender: req.user._id,
      content: `Rejected offer of ${offerMessage.metadata.offerPrice}`,
      type: 'system',
      readBy: [{ user: req.user._id, readAt: new Date() }],
      createdAt: new Date(),
    };
  } else if (status === 'countered') {
    // Create a new counter offer message
    systemMessage = {
      sender: req.user._id,
      content: `Counter offer: ${counterOffer}`,
      type: 'offer',
      metadata: {
        offerPrice: counterOffer,
        offerStatus: 'pending',
      },
      readBy: [{ user: req.user._id, readAt: new Date() }],
      createdAt: new Date(),
    };
  }

  if (systemMessage) {
    chat.messages.push(systemMessage);

    // Update last message
    chat.lastMessage = {
      content: systemMessage.content,
      sender: req.user._id,
      createdAt: systemMessage.createdAt,
    };

    // Increment unread count for other participant
    chat.participants.forEach((participantId) => {
      if (participantId.toString() !== req.user._id.toString()) {
        const currentCount = chat.unreadCount.get(participantId.toString()) || 0;
        chat.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });
  }

  await chat.save();

  // Populate sender info
  await chat.populate('messages.sender', 'name avatar');

  // Emit socket event
  const io = req.app.get('io');
  io.to(`chat:${chat._id}`).emit('offer-response', {
    chatId: chat._id,
    messageId: offerMessage._id,
    status,
    counterOffer: status === 'countered' ? counterOffer : undefined,
  });

  if (systemMessage) {
    const newMessage = chat.messages[chat.messages.length - 1];
    io.to(`chat:${chat._id}`).emit('new-message', {
      ...newMessage.toObject(),
      chat: chat._id,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Offer response sent successfully',
    },
  });
});
