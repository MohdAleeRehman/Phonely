import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { reportService } from '../../services/report.service';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'user' | 'listing';
  targetId: string;
  targetName: string;
}

const REPORT_REASONS = {
  user: [
    { value: 'scam', label: '🚫 Scam or Fraud' },
    { value: 'harassment', label: '😡 Harassment or Abuse' },
    { value: 'fake-photos', label: '📸 Using Fake Photos' },
    { value: 'spam', label: '📧 Spam Messages' },
    { value: 'inappropriate-content', label: '⚠️ Inappropriate Content' },
    { value: 'other', label: '🔍 Other' },
  ],
  listing: [
    { value: 'fake-listing', label: '🚫 Fake Listing' },
    { value: 'counterfeit-phone', label: '📱 Counterfeit Phone' },
    { value: 'misleading-information', label: '⚠️ Misleading Information' },
    { value: 'inappropriate-content', label: '😡 Inappropriate Content' },
    { value: 'scam', label: '💰 Suspected Scam' },
    { value: 'other', label: '🔍 Other' },
  ],
};

export default function ReportModal({ isOpen, onClose, reportType, targetId, targetName }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reportMutation = useMutation({
    mutationFn: reportService.createReport,
    onSuccess: (data) => {
      toast.success(data.message);
      onClose();
      setReason('');
      setDescription('');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to submit report';
      toast.error(errorMessage || 'Failed to submit report');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      toast.error('Please provide a detailed description (at least 10 characters)');
      return;
    }

    reportMutation.mutate({
      reportType,
      [reportType === 'user' ? 'reportedUser' : 'reportedListing']: targetId,
      reason,
      description: description.trim(),
    });
  };

  if (!isOpen) return null;

  const reasons = REPORT_REASONS[reportType];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-2xl font-black text-gray-900">
              🚨 Report {reportType === 'user' ? 'User' : 'Listing'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Target Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                You are reporting: <span className="font-bold text-gray-900">{targetName}</span>
              </p>
            </div>

            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Why are you reporting this {reportType}? *
              </label>
              <div className="space-y-2">
                {reasons.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      reason === r.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="mr-3 text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-gray-900">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Please provide details *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, include any evidence or context that will help us investigate..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                rows={5}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">
                {description.length}/500 characters (minimum 10)
              </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-bold">⚠️ Important:</span> False reports may result in action against your account.
                We review all reports within 24 hours. Thank you for helping keep Phonely safe!
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportMutation.isPending || !reason || description.trim().length < 10}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
