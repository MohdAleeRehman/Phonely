import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createOrGetChat,
  getMyChats,
  getChatById,
  sendMessage,
  markAsRead,
  getUnreadCount,
  sendOffer,
  respondToOffer,
} from '../controllers/chat.controller.js';

const router = express.Router();

/**
 * @route   GET /api/v1/chats/unread-count
 * @desc    Get total unread message count
 * @access  Private
 */
router.get('/unread-count', protect, getUnreadCount);

/**
 * @route   POST /api/v1/chats
 * @desc    Create or get existing chat for a listing
 * @access  Private
 */
router.post('/', protect, createOrGetChat);

/**
 * @route   GET /api/v1/chats
 * @desc    Get all chats for current user
 * @access  Private
 */
router.get('/', protect, getMyChats);

/**
 * @route   GET /api/v1/chats/:id
 * @desc    Get chat by ID
 * @access  Private
 */
router.get('/:id', protect, getChatById);

/**
 * @route   POST /api/v1/chats/:id/messages
 * @desc    Send a message in a chat
 * @access  Private
 */
router.post('/:id/messages', protect, sendMessage);

/**
 * @route   PUT /api/v1/chats/:id/read
 * @desc    Mark messages as read
 * @access  Private
 */
router.put('/:id/read', protect, markAsRead);

/**
 * @route   POST /api/v1/chats/:id/offer
 * @desc    Send a price offer in chat
 * @access  Private
 */
router.post('/:id/offer', protect, sendOffer);

/**
 * @route   PATCH /api/v1/chats/:chatId/offer/:messageId
 * @desc    Respond to a price offer (accept/reject/counter)
 * @access  Private
 */
router.patch('/:chatId/offer/:messageId', protect, respondToOffer);

export default router;
