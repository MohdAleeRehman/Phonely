import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Listing {
  _id: string;
  title: string;
  price: number;
}

interface PriceOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  listing: Listing;
}

export default function PriceOfferModal({
  isOpen,
  onClose,
  chatId,
  listing,
}: PriceOfferModalProps) {
  const listingTitle = listing?.title || 'Item';
  const listingPrice = listing?.price || 0;
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { mutate: sendOffer, isPending } = useMutation({
    mutationFn: async (data: { offerPrice: number; message?: string }) => {
      const response = await api.post(`/chats/${chatId}/offer`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Offer sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      handleClose();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to send offer');
    },
  });

  const handleClose = () => {
    setOfferPrice('');
    setMessage('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (price >= listingPrice) {
      toast.error('Offer must be lower than listing price');
      return;
    }

    sendOffer({
      offerPrice: price,
      message: message.trim() || undefined,
    });
  };

  const percentageOff = offerPrice
    ? Math.round(((listingPrice - parseFloat(offerPrice)) / listingPrice) * 100)
    : 0;

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
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Make an Offer</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={isPending}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Listing Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Item</p>
                  <p className="font-semibold">{listingTitle}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Listed Price: <span className="font-bold text-primary-600">PKR {listingPrice.toLocaleString()}</span>
                  </p>
                </div>

                {/* Offer Price Input */}
                <div>
                  <label htmlFor="offerPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Offer *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">PKR</span>
                    <input
                      id="offerPrice"
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="0"
                      className="input-field pl-14 w-full"
                      min="1"
                      max={listingPrice - 1}
                      required
                      disabled={isPending}
                    />
                  </div>
                  {offerPrice && percentageOff > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm mt-2"
                    >
                      <span className="text-green-600 font-medium">{percentageOff}% off</span> the listing price
                    </motion.p>
                  )}
                </div>

                {/* Message Input */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a note with your offer..."
                    className="input-field w-full min-h-20 resize-none"
                    maxLength={200}
                    disabled={isPending}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">{message.length}/200</p>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 The seller will be notified of your offer and can accept, reject, or send a counter offer.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-secondary flex-1"
                    disabled={isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isPending || !offerPrice}
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send Offer'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
