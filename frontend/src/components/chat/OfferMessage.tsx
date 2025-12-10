import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Message } from '../../types';

interface OfferMessageProps {
  message: Message;
  chatId: string;
  isOwnMessage: boolean;
}

export default function OfferMessage({ message, chatId, isOwnMessage }: OfferMessageProps) {
  const queryClient = useQueryClient();
  const offerPrice = message.metadata?.offerPrice || 0;
  const offerStatus = message.metadata?.offerStatus || 'pending';

  const { mutate: respondToOffer, isPending } = useMutation({
    mutationFn: async (data: { status: string; counterOffer?: number }) => {
      const response = await api.patch(`/chats/${chatId}/offer/${message._id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to respond to offer');
    },
  });

  const handleAccept = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-medium">Accept this offer?</p>
        <p className="text-sm text-gray-600">PKR {offerPrice.toLocaleString()}</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              respondToOffer({ status: 'accepted' });
              toast.dismiss(t.id);
              toast.success('Offer accepted!');
            }}
            className="btn-primary text-sm py-1 px-3"
          >
            Yes, Accept
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="btn-secondary text-sm py-1 px-3"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleReject = () => {
    respondToOffer({ status: 'rejected' });
    toast.success('Offer rejected');
  };

  const statusColors = {
    pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    accepted: 'bg-green-100 border-green-300 text-green-800',
    rejected: 'bg-red-100 border-red-300 text-red-800',
    countered: 'bg-blue-100 border-blue-300 text-blue-800',
  };

  const statusIcons = {
    pending: '⏳',
    accepted: '✅',
    rejected: '❌',
    countered: '🔄',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-sm border-2 rounded-lg p-4 ${
          isOwnMessage
            ? 'bg-primary-50 border-primary-200'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Offer Header */}
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-gray-900">Price Offer</span>
        </div>

        {/* Offer Price */}
        <div className="mb-3">
          <p className="text-3xl font-bold text-primary-600">
            PKR {offerPrice.toLocaleString()}
          </p>
        </div>

        {/* Message Content */}
        {message.content && (
          <p className="text-gray-700 text-sm mb-3">{message.content}</p>
        )}

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${statusColors[offerStatus as keyof typeof statusColors]}`}>
          <span>{statusIcons[offerStatus as keyof typeof statusIcons]}</span>
          <span className="capitalize">{offerStatus}</span>
        </div>

        {/* Action Buttons - Only show if it's not your offer and status is pending */}
        {!isOwnMessage && offerStatus === 'pending' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleAccept}
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isPending ? '...' : 'Accept'}
            </button>
            <button
              onClick={handleReject}
              disabled={isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isPending ? '...' : 'Reject'}
            </button>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-2">
          {new Date(message.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </p>
      </div>
    </motion.div>
  );
}
