import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getMyChats,
  getChatById,
  sendMessage,
  markAsRead,
} from '../controllers/chat.controller.js';

const router = express.Router();

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

export default router;
