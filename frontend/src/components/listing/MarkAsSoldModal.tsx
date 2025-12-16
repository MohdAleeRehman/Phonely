import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listingService } from '../../services/listing.service';

interface MarkAsSoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

export function MarkAsSoldModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
}: MarkAsSoldModalProps) {
  const [selectedBuyer, setSelectedBuyer] = useState<string>('');
  const [soldOutside, setSoldOutside] = useState(false);
  const queryClient = useQueryClient();

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedBuyer('');
    setSoldOutside(false);
    onClose();
  };

  // Fetch chat participants
  const { data: participantsData, isLoading } = useQuery({
    queryKey: ['chat-participants', listingId],
    queryFn: () => listingService.getChatParticipants(listingId),
    enabled: isOpen,
  });

  // Mark as sold mutation
  const markAsSoldMutation = useMutation({
    mutationFn: (data: { soldTo?: string; soldOutside?: boolean }) => 
      listingService.markAsSold(listingId, data),
    onSuccess: () => {
      toast.success('Listing marked as sold!');
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      handleClose();
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to mark as sold');
    },
  });

  const handleSubmit = () => {
    if (soldOutside) {
      markAsSoldMutation.mutate({ soldOutside: true });
    } else if (selectedBuyer) {
      markAsSoldMutation.mutate({ soldTo: selectedBuyer });
    } else {
      toast.error('Please select a buyer or mark as sold outside Phonely');
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-white dark:text-white">
                    Mark as Sold
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {listingTitle}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Sold Outside Option */}
                    <div
                      onClick={() => {
                        setSoldOutside(true);
                        setSelectedBuyer('');
                      }}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        soldOutside
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-white/10 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            soldOutside
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {soldOutside && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌐</span>
                          <span className="font-medium text-white dark:text-white">
                            Sold Outside Phonely
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          You sold this item through another platform or in person
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    {participantsData && participantsData.length > 0 && (
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            or select buyer
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Chat Participants */}
                    {participantsData && participantsData.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-200 dark:text-gray-300">
                          Select from chat participants:
                        </p>
                        {participantsData.map((participant: { _id: string; name: string; avatar?: string }) => (
                          <div
                            key={participant._id}
                            onClick={() => {
                              setSelectedBuyer(participant._id);
                              setSoldOutside(false);
                            }}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedBuyer === participant._id
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-white/10 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="mt-0.5">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedBuyer === participant._id
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {selectedBuyer === participant._id && (
                                  <span className="text-white text-xs">✓</span>
                                )}
                              </div>
                            </div>
                            {participant.avatar ? (
                              <img
                                src={participant.avatar}
                                alt={participant.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {participant.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="font-medium text-white dark:text-white">
                              {participant.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      !isLoading &&
                      !soldOutside && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          No chat participants found. You can mark as sold outside Phonely.
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 p-6 border-t border-white/10 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-200 dark:text-gray-300 rounded-lg hover:bg-white/5 dark:hover:bg-gray-700 transition-colors"
                  disabled={markAsSoldMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={markAsSoldMutation.isPending || (!selectedBuyer && !soldOutside)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {markAsSoldMutation.isPending ? 'Marking...' : 'Mark as Sold'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
