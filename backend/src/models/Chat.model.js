import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: 2000,
        },
        type: {
          type: String,
          enum: ['text', 'image', 'offer', 'system'],
          default: 'text',
        },
        metadata: {
          // For offer messages
          offerPrice: Number,
          offerStatus: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'countered'],
          },
          // For image messages
          imageUrl: String,
        },
        readBy: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            readAt: Date,
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: Date,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'blocked'],
      default: 'active',
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding chats between specific users
chatSchema.index({ participants: 1, listing: 1 });
chatSchema.index({ 'lastMessage.createdAt': -1 });

// Method to add a new message
chatSchema.methods.addMessage = function (senderId, content, type = 'text', metadata = {}) {
  const message = {
    sender: senderId,
    content,
    type,
    metadata,
    readBy: [{ user: senderId, readAt: new Date() }],
    createdAt: new Date(),
  };

  this.messages.push(message);
  this.lastMessage = {
    content,
    sender: senderId,
    createdAt: message.createdAt,
  };

  // Update unread count for other participants
  this.participants.forEach((participantId) => {
    if (participantId.toString() !== senderId.toString()) {
      const currentCount = this.unreadCount.get(participantId.toString()) || 0;
      this.unreadCount.set(participantId.toString(), currentCount + 1);
    }
  });

  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function (userId) {
  const unreadMessages = this.messages.filter(
    (msg) =>
      msg.sender.toString() !== userId.toString() &&
      !msg.readBy.some((read) => read.user.toString() === userId.toString())
  );

  unreadMessages.forEach((msg) => {
    msg.readBy.push({ user: userId, readAt: new Date() });
  });

  this.unreadCount.set(userId.toString(), 0);

  return this.save();
};

// Static method to find or create a chat
chatSchema.statics.findOrCreate = async function (listingId, user1Id, user2Id) {
  let chat = await this.findOne({
    listing: listingId,
    participants: { $all: [user1Id, user2Id] },
  });

  if (!chat) {
    chat = await this.create({
      listing: listingId,
      participants: [user1Id, user2Id],
      unreadCount: {
        [user1Id.toString()]: 0,
        [user2Id.toString()]: 0,
      },
    });
  }

  return chat;
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
