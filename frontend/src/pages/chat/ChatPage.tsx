import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { chatService } from '../../services/chat.service';
import { socketService } from '../../services/socket.service';
import { useAuthStore } from '../../store/authStore';
import type { Chat, Message, ChatData } from '../../types';
import Loading from '../../components/common/Loading';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatSkeleton from '../../components/chat/ChatSkeleton';
import PriceOfferModal from '../../components/chat/PriceOfferModal';
import SharePhoneModal from '../../components/chat/SharePhoneModal';
import OfferMessage from '../../components/chat/OfferMessage';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId?: string }>();
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  const [selectedChat, setSelectedChat] = useState<string | null>(chatId || null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPriceOffer, setShowPriceOffer] = useState(false);
  const [showSharePhone, setShowSharePhone] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update selected chat when URL changes
  useEffect(() => {
    if (chatId) {
      setSelectedChat(chatId);
    }
  }, [chatId]);

  // Fetch all chats
  const { data: chatsResponse, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: chatService.getChats,
    refetchOnMount: true,
  });

  const chats = (chatsResponse?.data?.chats || []) as Chat[];

  // Fetch messages for selected chat
  const { data: chatData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat', selectedChat],
    queryFn: () => chatService.getChatById(selectedChat!),
    enabled: !!selectedChat,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, message }: { chatId: string; message: string }) =>
      chatService.sendMessage(chatId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', selectedChat] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setMessageText('');
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: chatService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // Socket.IO setup - only connect once per user session
  useEffect(() => {
    if (!user || !token) return;

    const userId = user._id || user.id;
    if (!userId) return;

    // Only actually connect on first real mount (not React Strict Mode's remount)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      socketService.connect(token, userId);
    }

    // Don't disconnect on cleanup in dev mode
    return () => {
      // Only disconnect if component is truly unmounting (not React Strict Mode)
      // In production, this will work normally
      if (import.meta.env.PROD) {
        socketService.disconnect();
      }
    };
  }, [user, token]); // Only reconnect if user/token changes

  // Socket message handlers defined at component level
  const handleNewMessage = useCallback((message: Message) => {
    if (!user) return;
    
    // Auto-mark as read if this is the currently open chat and message is from another user
    const senderId = typeof message.sender === 'string' ? message.sender : message.sender.id || message.sender._id;
    const currentUserId = user._id || user.id;
    
    if (message.chat === selectedChat && senderId !== currentUserId) {
      // Automatically mark as read
      markAsReadMutation.mutate(message.chat);
    }
    
    // Update chat messages for the specific chat
    const updated = queryClient.setQueryData(['chat', message.chat], (oldData: ChatData | undefined) => {
      if (!oldData) {
        return oldData;
      }
      
      // Check if message already exists to avoid duplicates
      const messageExists = oldData.chat.messages?.some(m => m._id === message._id);
      if (messageExists) {
        return oldData;
      }
      
      const updatedData = {
        ...oldData,
        chat: {
          ...oldData.chat,
          messages: [...(oldData.chat.messages || []), message],
        },
      };
      return updatedData;
    });
    
    // If no cache data was found, invalidate to trigger refetch
    if (!updated) {
      queryClient.invalidateQueries({ queryKey: ['chat', message.chat] });
    }

    // Update chats list
    queryClient.invalidateQueries({ queryKey: ['chats'] });

    // Invalidate unread count
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });

    // Show notification if message is from another user and chat is not currently selected
    if (senderId !== currentUserId && message.chat !== selectedChat) {
      // Get sender name
      let senderName = 'Someone';
      if (typeof message.sender === 'object' && message.sender.name) {
        senderName = message.sender.name;
      }
      
      toast.success(`New message from ${senderName}`, {
        duration: 4000,
        position: 'top-right',
        icon: '💬',
      });
    }
  }, [user, selectedChat, markAsReadMutation, queryClient]);

  const handleTypingEvent = useCallback((data: { chatId: string; userId: string }) => {
    if (data.chatId === selectedChat && data.userId !== user?._id) {
      setIsTyping(true);
    }
  }, [selectedChat, user]);

  const handleStopTypingEvent = useCallback((data: { chatId: string; userId: string }) => {
    if (data.chatId === selectedChat && data.userId !== user?._id) {
      setIsTyping(false);
    }
  }, [selectedChat, user]);

  const handleMessagesRead = useCallback((data: { chatId: string; userId: string }) => {
    // Invalidate unread count to update badges
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    
    // Invalidate chats list to update sidebar
    queryClient.invalidateQueries({ queryKey: ['chats'] });
    
    // Update current chat data if it's the one that was read
    if (data.chatId === selectedChat) {
      queryClient.invalidateQueries({ queryKey: ['chat', data.chatId] });
    }
  }, [selectedChat, queryClient]);

  // Socket message listeners - separate effect
  useEffect(() => {
    if (!user) return;

    socketService.onNewMessage(handleNewMessage);
    socketService.onTyping(handleTypingEvent);
    socketService.onStopTyping(handleStopTypingEvent);
    socketService.onMessagesRead(handleMessagesRead);

    // Cleanup listeners on unmount
    return () => {
      socketService.off('new-message');
      socketService.off('typing');
      socketService.off('stop-typing');
      socketService.off('messages-read');
    };
  }, [user, handleNewMessage, handleTypingEvent, handleStopTypingEvent, handleMessagesRead]);

  // Join/leave chat rooms
  useEffect(() => {
    if (selectedChat) {
      socketService.joinChat(selectedChat);
      markAsReadMutation.mutate(selectedChat);

      return () => {
        socketService.leaveChat(selectedChat);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatData?.chat?.messages]);

  // Handle typing indicator with debounce (300ms)
  const handleTyping = useCallback(() => {
    if (selectedChat) {
      socketService.emitTyping(selectedChat);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emitStopTyping(selectedChat);
      }, 3000); // Stop typing after 3 seconds of inactivity
    }
  }, [selectedChat]);

  const handleSendMessage = useCallback(() => {
    if (messageText.trim() && selectedChat) {
      // Send via REST API
      sendMessageMutation.mutate({
        chatId: selectedChat,
        message: messageText.trim(),
      });

      // Also send via Socket.IO for real-time delivery
      socketService.sendMessage(selectedChat, messageText.trim());
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socketService.emitStopTyping(selectedChat);
      }
    }
  }, [messageText, selectedChat, sendMessageMutation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherUser = (chat: Chat) => {
    if (!user) {
      console.warn('User not loaded yet');
      return null;
    }
    // Get user ID - handle both _id and id properties
    const currentUserId = user._id || user.id;
    if (!currentUserId) {
      console.error('User object has no _id or id property:', user);
      return null;
    }
    // Find the other participant (not the current user)
    const otherParticipant = chat.participants?.find(
      (p) => {
        if (typeof p === 'string') return false;
        const participantId = p._id || p.id;
        return participantId !== currentUserId;
      }
    );
    return typeof otherParticipant !== 'string' ? otherParticipant : null;
  };

  const getListing = (chat: Chat) => {
    return typeof chat.listing !== 'string' ? chat.listing : null;
  };

  if (chatsLoading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return <Loading fullScreen />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 -left-20 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -60, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r-2 border-gray-200 bg-white/90 backdrop-blur-sm overflow-y-auto relative z-10 shadow-lg">
        <div className="p-4 border-b-2 border-gray-200 bg-white/80 backdrop-blur-sm">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <span>💬</span> <span className="bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Messages</span>
          </h2>
        </div>

        {chats.length > 0 ? (
          <div className="divide-y">
            {chats.map((chat: Chat) => {
              const otherUser = getOtherUser(chat);
              const listing = getListing(chat);
              
              if (!otherUser || !listing) return null;

              return (
                <motion.button
                  key={chat._id}
                  onClick={() => setSelectedChat(chat._id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(249, 250, 251, 1)' }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedChat === chat._id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Listing Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                      {listing.images[0] ? (
                        <img
                          src={typeof listing.images[0] === 'string' ? listing.images[0] : listing.images[0].url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold truncate">{otherUser.name}</p>
                        {(() => {
                          const userId = user?._id || user?.id;
                          const unreadCount = userId && chat.unreadCount ? (chat.unreadCount[userId] || 0) : 0;
                          return unreadCount > 0 ? (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-5 text-center"
                            >
                              {unreadCount}
                            </motion.span>
                          ) : null;
                        })()}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{listing.title}</p>
                      <p className="text-sm font-semibold text-primary-600">
                        PKR {listing.price.toLocaleString()}
                      </p>
                      {chat.lastMessage?.content && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center text-gray-500"
          >
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="text-sm mt-2">Start chatting with sellers 🚀</p>
          </motion.div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/50 backdrop-blur-sm relative z-10">
        {selectedChat && chatData ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/90 backdrop-blur-sm border-b p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold shadow-lg">
                  {getOtherUser(chatData.chat)?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{getOtherUser(chatData.chat)?.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    📱 {getListing(chatData.chat)?.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <ChatSkeleton />
              ) : chatData?.chat?.messages && chatData.chat.messages.length > 0 ? (
                <>
                  {chatData.chat.messages.map((message: Message) => {
                    const currentUserId = user._id || user.id;
                    const senderId = typeof message.sender === 'string' ? message.sender : (message.sender._id || message.sender.id);
                    const isOwnMessage = senderId === currentUserId;

                    // Render OfferMessage for offer type
                    if (message.type === 'offer') {
                      return (
                        <OfferMessage
                          key={message._id}
                          message={message}
                          chatId={selectedChat}
                          isOwnMessage={isOwnMessage}
                        />
                      );
                    }

                    return (
                      <MessageBubble
                        key={message._id}
                        message={message}
                        isOwnMessage={isOwnMessage}
                      />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center text-gray-500 mt-8"
                >
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm mt-2">Send a message to start the conversation 🚀</p>
                </motion.div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPriceOffer(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 font-medium"
                >
                  <span className="text-lg">💰</span>
                  <span>Make Offer</span>
                </button>
                <button
                  onClick={() => setShowSharePhone(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200 font-medium"
                >
                  <span className="text-lg">📱</span>
                  <span>Share Number</span>
                </button>
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message... ✨"
                  className="input-field flex-1"
                  disabled={sendMessageMutation.isPending}
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary px-6 disabled:opacity-50"
                >
                  {sendMessageMutation.isPending ? (
                    <Loading size="sm" />
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center text-gray-500"
          >
            <div className="text-center">
              <div className="text-8xl mb-4">💬</div>
              <p className="text-2xl font-bold bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                Select a conversation
              </p>
              <p className="text-lg">Start chatting with buyers and sellers ✨</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {selectedChat && chatData?.chat && typeof chatData.chat.listing === 'object' && (
        <>
          <PriceOfferModal
            isOpen={showPriceOffer}
            onClose={() => setShowPriceOffer(false)}
            chatId={selectedChat}
            listing={chatData.chat.listing}
          />
          <SharePhoneModal
            isOpen={showSharePhone}
            onClose={() => setShowSharePhone(false)}
            chatId={selectedChat}
            recipientName={getOtherUser(chatData.chat)?.name || 'User'}
            userPhone={user?.phone || ''}
          />
        </>
      )}
    </div>
  );
}


