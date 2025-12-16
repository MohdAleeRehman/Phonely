import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { socketService } from '../../services/socket.service';

interface SharePhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  recipientName: string;
  userPhone: string;
}

export default function SharePhoneModal({
  isOpen,
  onClose,
  chatId,
  recipientName,
  userPhone,
}: SharePhoneModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const queryClient = useQueryClient();

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Send phone number via socket
      socketService.sharePhoneNumber(chatId, userPhone);
      
      // Also send as a system message via API
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      await fetch(`${baseURL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content: `Phone Number Shared: ${userPhone}`,
          type: 'phone',
          metadata: {
            phoneNumber: userPhone,
          },
        }),
      });

      toast.success('Phone number shared!');
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      onClose();
    } catch (error) {
      console.error('Error sharing phone number:', error);
      toast.error('Failed to share phone number');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Share Phone Number</h2>
                    <p className="text-sm text-gray-400">With {recipientName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                  disabled={isSharing}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Phone Display */}
                <div className="bg-linear-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Your Phone Number</p>
                  <p className="text-2xl font-bold text-cyan-300">{userPhone}</p>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-300 mb-1">Privacy Notice</p>
                      <p className="text-xs text-yellow-200">
                        Your phone number will be visible to {recipientName}. Only share with trusted users.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                  <p className="text-sm text-blue-300">
                    <span className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                      <span>This will send your phone number in the chat. You can call or text each other directly.</span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={onClose}
                  className="btn-secondary flex-1"
                  disabled={isSharing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sharing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Share Number
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
