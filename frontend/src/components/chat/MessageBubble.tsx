import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble = memo(({ message, isOwnMessage }: MessageBubbleProps) => {
  const isPhoneMessage = message.type === 'phone';
  const isOfferMessage = message.type === 'offer';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-sm px-4 py-2 rounded-2xl shadow-sm ${
          isPhoneMessage
            ? 'bg-green-500/20 backdrop-blur-md border-2 border-green-400 text-white'
            : isOfferMessage
            ? 'bg-blue-500/20 backdrop-blur-md border-2 border-blue-400 text-white'
            : isOwnMessage
            ? 'bg-linear-to-r from-cyan-500 to-purple-600 text-white'
            : 'bg-white/10 backdrop-blur-md border border-white/20 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap wrap-break-word font-medium">{message.content}</p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p
            className={`text-xs ${
              isOwnMessage ? 'text-white/70' : 'text-gray-300'
            }`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {isOwnMessage && (
            <span className="text-xs">
              {message.readBy && message.readBy.length > 1 ? (
                // Read by recipient (blue double tick)
                <span className="text-blue-300" title="Read">✓✓</span>
              ) : (
                // Delivered but not read (gray double tick)
                <span className={isOwnMessage ? 'text-white/70' : 'text-gray-400'} title="Delivered">✓✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
