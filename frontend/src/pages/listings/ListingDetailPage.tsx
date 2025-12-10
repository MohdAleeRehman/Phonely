import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { listingService } from '../../services/listing.service';
import { chatService } from '../../services/chat.service';
import { useAuthStore } from '../../store/authStore';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import ReportModal from '../../components/common/ReportModal';
import AIInspectionReport from '../../components/listings/AIInspectionReport';
import { MarkAsSoldModal } from '../../components/listing/MarkAsSoldModal';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'user' | 'listing'; id: string; name: string } | null>(null);
  const [showMarkAsSold, setShowMarkAsSold] = useState(false);

  const { data: listing, isLoading, error, refetch } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingService.getListingById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => listingService.deleteListing(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      navigate('/listings');
    },
  });

  const contactMutation = useMutation({
    mutationFn: () => chatService.createChat(id!),
    onSuccess: async (chat) => {
      // Invalidate chats to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      // Navigate to the chat page with the new chat ID
      navigate(`/chat/${chat._id}`);
    },
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ErrorMessage
          message="Failed to load listing"
          onRetry={refetch}
        />
      </div>
    );
  }

  // Check ownership - handle both _id and id fields, and seller as object or string
  const userId = user?._id || user?.id;
  const sellerId = typeof listing.seller === 'object' ? (listing.seller._id || listing.seller.id) : listing.seller;
  const isOwner = userId === sellerId;
  
  const imageTypeLabels: Record<string, string> = {
    'front': '📱 Front',
    'back': '🔄 Back',
    'left-side': '◀️ Left',
    'right-side': '▶️ Right',
    'top': '⬆️ Top',
    'bottom': '⬇️ Bottom',
    'front-camera-on': '🤳 Selfie',
    'back-camera-on': '📷 Camera',
    'display-test': '🖥️ Display',
    'screen': '🖥️ Screen',
    'accessories': '📦 Box',
    'other': '📸 Photo',
  };

  const getImageUrl = (img: string | { url: string }) => {
    return typeof img === 'string' ? img : img.url;
  };

  const getImageType = (img: string | { url: string; type?: string }, index: number) => {
    if (typeof img === 'object' && img.type) {
      return imageTypeLabels[img.type] || `Photo ${index + 1}`;
    }
    return `Photo ${index + 1}`;
  };

  const conditionColor = {
    excellent: 'bg-green-100 text-green-800 border-green-300',
    good: 'bg-blue-100 text-blue-800 border-blue-300',
    fair: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    poor: 'bg-red-100 text-red-800 border-red-300',
  }[listing.condition || 'good'];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden relative shadow-xl border-4 border-white">
                {listing.images.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(listing.images[selectedImage])}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                      {getImageType(listing.images[selectedImage], selectedImage)}
                    </div>
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      {selectedImage + 1} / {listing.images.length}
                    </div>

                    {/* Navigation Arrows */}
                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-lg transition-all hover:scale-110"
                          aria-label="Previous image"
                        >
                          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-lg transition-all hover:scale-110"
                          aria-label="Next image"
                        >
                          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                    📱
                  </div>
                )}
              </div>

              {/* Thumbnail Dots Indicator */}
              {listing.images.length > 1 && (
                <div className="flex justify-center gap-2">
                  {listing.images.map((_img, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`transition-all ${
                        selectedImage === index
                          ? 'w-8 h-2 bg-primary-600'
                          : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                      } rounded-full`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Listing Details */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Title and Price */}
              <div className="card bg-linear-to-br from-white to-gray-50 border-2 border-primary-100">
                <div className="flex flex-col gap-3 mb-4">
                  <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    <span className="bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {listing.title}
                    </span>
                  </h1>
                  {listing.inspectionReport && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="flex items-center gap-2 text-base text-green-600 bg-green-50 px-4 py-2 rounded-full font-semibold border-2 border-green-200 w-fit"
                    >
                      <span className="text-xl">✅</span>
                      AI Verified
                    </motion.span>
                  )}
                </div>
                <div className="flex items-end gap-3 mb-4 flex-wrap">
                  <p className="text-5xl font-bold bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                    PKR {listing.price.toLocaleString()}
                  </p>
                  <span className={`px-5 py-2.5 rounded-full text-base font-bold ${conditionColor} border-2 capitalize`}>
                    {listing.condition}
                  </span>
                  {listing.priceNegotiable && (
                    <span className="px-5 py-2.5 rounded-full text-base font-bold bg-blue-50 text-blue-700 border-2 border-blue-200">
                      💬 Negotiable
                    </span>
                  )}
                  {listing.ptaApproved && (
                    <span className="px-5 py-2.5 rounded-full text-base font-bold bg-green-50 text-green-700 border-2 border-green-200">
                      ✅ PTA Approved
                    </span>
                  )}
                  {!listing.ptaApproved && (
                    <span className="px-5 py-2.5 rounded-full text-base font-bold bg-red-50 text-red-700 border-2 border-red-200">
                      ❌ Non-PTA
                    </span>
                  )}
                </div>
                {listing.priceRange && (
                  <div className="bg-linear-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
                    <p className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-xl">💰</span> AI Suggested Price Range
                    </p>
                    <p className="text-2xl font-bold text-primary-600">
                      PKR {listing.priceRange.min.toLocaleString()} - {listing.priceRange.max.toLocaleString()}
                    </p>
                    {listing.price < listing.priceRange.min && (
                      <p className="text-base text-green-600 font-semibold mt-2 flex items-center gap-2">
                        <span className="text-lg">🔥</span> Great deal! Below market value
                      </p>
                    )}
                    {listing.price > listing.priceRange.max && (
                      <p className="text-base text-orange-600 font-semibold mt-2 flex items-center gap-2">
                        <span>⚠️</span> Above suggested price range
                      </p>
                    )}
                  </div>
                )}

                {/* Report Listing Button - Only show if not owner and user is logged in */}
                {!isOwner && user && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setReportTarget({ type: 'listing', id: listing._id, name: listing.title });
                        setShowReportModal(true);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                    >
                      <span>🚨</span> Report this listing
                    </button>
                  </div>
                )}
              </div>

              {/* Phone Specifications */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200"
              >
                <h2 className="text-xl font-bold mb-4">
                  <span className="mr-2">📱</span>
                  <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Specifications
                  </span>
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-gray-600 text-xs mb-1">Brand</p>
                    <p className="font-bold text-lg">{listing.phone.brand}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-gray-600 text-xs mb-1">Model</p>
                    <p className="font-bold text-lg">{listing.phone.model}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-gray-600 text-xs mb-1">Storage</p>
                    <p className="font-bold text-lg">{listing.phone.storage}</p>
                  </div>
                  {listing.phone.ram && (
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="text-gray-600 text-xs mb-1">RAM</p>
                      <p className="font-bold text-lg">{listing.phone.ram}</p>
                    </div>
                  )}
                  {listing.phone.color && (
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="text-gray-600 text-xs mb-1">Color</p>
                      <p className="font-bold text-lg">{listing.phone.color}</p>
                    </div>
                  )}
                  {listing.phone.imei && (
                    <div className="bg-white rounded-lg p-3 border border-blue-200 col-span-2">
                      <p className="text-gray-600 text-xs mb-1">IMEI</p>
                      <p className="font-bold text-sm font-mono">{listing.phone.imei}</p>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-gray-600 text-xs mb-1">Warranty</p>
                    <p className="font-bold text-lg">
                      {listing.phone.warranty?.hasWarranty ? '✅ Yes' : '❌ No'}
                      {listing.phone.warranty?.hasWarranty && listing.phone.warranty.type && (
                        <span className="text-sm font-normal text-gray-600 ml-2">({listing.phone.warranty.type})</span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Warranty Details */}
              {listing.phone.warranty?.hasWarranty && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="card bg-linear-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200"
                >
                  <h2 className="text-xl font-bold mb-4">
                    <span className="mr-2">✅</span>
                    <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Warranty Information
                    </span>
                  </h2>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm mb-1">Warranty Type</p>
                          <p className="font-bold text-lg capitalize">{listing.phone.warranty.type}</p>
                        </div>
                        <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold">
                          Active
                        </div>
                      </div>
                    </div>
                    {listing.phone.warranty.expiryDate && (
                      <div className="bg-white rounded-lg p-4 border border-emerald-200">
                        <p className="text-gray-600 text-sm mb-1">Valid Until</p>
                        <p className="font-bold text-lg">
                          {new Date(listing.phone.warranty.expiryDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Battery Health & Condition Details */}
              {(listing.conditionDetails?.batteryHealth || listing.conditionDetails?.screenCondition || listing.conditionDetails?.bodyCondition) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-200"
                >
                  <h2 className="text-xl font-bold mb-4">
                    <span className="mr-2">🔋</span>
                    <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Device Condition
                    </span>
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Battery Health - Apple Only */}
                    {listing.phone?.brand === 'Apple' && listing.conditionDetails?.batteryHealth && (
                      <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700 font-medium flex items-center gap-2">
                            <span>🔋</span> Battery Health
                          </span>
                          <span className={`text-2xl font-bold ${
                            listing.conditionDetails.batteryHealth >= 80 ? 'text-green-600' :
                            listing.conditionDetails.batteryHealth >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {listing.conditionDetails.batteryHealth}%
                          </span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${listing.conditionDetails.batteryHealth}%` }}
                            transition={{ delay: 0.6, duration: 1 }}
                            className={`h-full ${
                              listing.conditionDetails.batteryHealth >= 80 ? 'bg-green-500' :
                              listing.conditionDetails.batteryHealth >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {listing.conditionDetails.batteryHealth >= 80 ? '✓ Excellent battery condition' :
                           listing.conditionDetails.batteryHealth >= 60 ? '⚠ Battery showing wear' :
                           '⚠ Consider battery replacement'}
                        </p>
                      </div>
                    )}

                    {/* Screen Condition */}
                    {listing.conditionDetails?.screenCondition && (
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                          <span>📱</span> Screen Condition
                        </p>
                        <p className="font-bold text-lg capitalize">{listing.conditionDetails.screenCondition}</p>
                      </div>
                    )}

                    {/* Body Condition */}
                    {listing.conditionDetails?.bodyCondition && (
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                          <span>📦</span> Body Condition
                        </p>
                        <p className="font-bold text-lg capitalize">{listing.conditionDetails.bodyCondition}</p>
                      </div>
                    )}

                    {/* Display Quality */}
                    {listing.conditionDetails?.displayQuality && (
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                          <span>✨</span> Display Quality
                        </p>
                        <p className="font-bold text-lg capitalize flex items-center gap-2">
                          {listing.conditionDetails.displayQuality === 'flawless' && '💎 Flawless'}
                          {listing.conditionDetails.displayQuality === 'minor-scratches' && '✓ Minor Scratches'}
                          {listing.conditionDetails.displayQuality === 'noticeable-wear' && '⚠ Noticeable Wear'}
                          {listing.conditionDetails.displayQuality === 'cracked' && '❌ Cracked'}
                        </p>
                      </div>
                    )}

                    {/* All Features Working */}
                    {listing.conditionDetails?.allFeaturesWorking !== undefined && (
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                          <span>⚙️</span> Functionality Status
                        </p>
                        <p className={`font-bold text-lg ${listing.conditionDetails.allFeaturesWorking ? 'text-green-600' : 'text-orange-600'}`}>
                          {listing.conditionDetails.allFeaturesWorking ? '✅ All Features Working' : '⚠️ Some Issues Present'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Functional Issues */}
              {listing.conditionDetails?.functionalIssues && listing.conditionDetails.functionalIssues.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="card bg-linear-to-br from-orange-50 to-orange-100 border-2 border-orange-200"
                >
                  <h2 className="text-xl font-bold mb-4">
                    <span className="mr-2">⚠️</span>
                    <span className="bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Known Issues
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {listing.conditionDetails.functionalIssues.map((issue, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-orange-200 flex items-start gap-3">
                        <span className="text-orange-600 text-lg mt-0.5">⚠️</span>
                        <span className="text-gray-700 font-medium">{issue}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Additional Notes */}
              {listing.conditionDetails?.additionalNotes && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="card bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-200"
                >
                  <h2 className="text-xl font-bold mb-4">
                    <span className="mr-2">📝</span>
                    <span className="bg-linear-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                      Additional Notes
                    </span>
                  </h2>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{listing.conditionDetails.additionalNotes}</p>
                  </div>
                </motion.div>
              )}

              {/* AI Inspection Report */}
              {listing.inspectionReport?.reportId && typeof listing.inspectionReport.reportId === 'string' && (
                <AIInspectionReport 
                  inspectionId={listing.inspectionReport.reportId} 
                  listingPrice={listing.price}
                />
              )}

              {/* Description */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-200"
              >
                <h2 className="text-xl font-bold mb-4">
                  <span className="mr-2">📝</span>
                  <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Description
                  </span>
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </motion.div>

              {/* Functionality Issues */}
              {listing.functionalityIssues && listing.functionalityIssues.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="card bg-linear-to-br from-orange-50 to-orange-100 border-2 border-orange-200"
                >
                  <h2 className="text-xl font-bold mb-4">
                    <span className="mr-2">⚠️</span>
                    <span className="bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Functionality Issues
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {listing.functionalityIssues.map((issue: string, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border-2 border-orange-200 flex items-center gap-2">
                        <span className="text-orange-600">❌</span>
                        <span className="text-gray-700 font-medium">{issue}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Physical Damage */}
              {listing.physicalDamage && listing.physicalDamage.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="card bg-linear-to-br from-red-50 to-red-100 border-2 border-red-200"
                >
                  <h2 className="text-xl font-bold mb-4">
                    <span className="mr-2">💔</span>
                    <span className="bg-linear-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Physical Damage
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {listing.physicalDamage.map((damage: string, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border-2 border-red-200 flex items-center gap-2">
                        <span className="text-red-600">🔴</span>
                        <span className="text-gray-700 font-medium">{damage}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Repair History */}
              {listing.repairHistory && listing.repairHistory.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="card bg-linear-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200"
                >
                  <h2 className="text-xl font-bold mb-4">
                    <span className="mr-2">🔧</span>
                    <span className="bg-linear-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      Repair History
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {listing.repairHistory.map((repair: string, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border-2 border-yellow-200 flex items-center gap-2">
                        <span className="text-yellow-600">🔧</span>
                        <span className="text-gray-700 font-medium">{repair}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Cosmetic Condition */}
              {listing.cosmeticCondition && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="card bg-linear-to-br from-teal-50 to-teal-100 border-2 border-teal-200"
                >
                  <h2 className="text-xl font-bold mb-4">
                    <span className="mr-2">✨</span>
                    <span className="bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Cosmetic Condition
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {listing.cosmeticCondition.screenCondition && (
                      <div className="bg-white rounded-lg p-3 border-2 border-teal-200">
                        <p className="text-gray-600 text-xs mb-1">Screen</p>
                        <p className="font-bold text-lg capitalize">{listing.cosmeticCondition.screenCondition}</p>
                      </div>
                    )}
                    {listing.cosmeticCondition.bodyCondition && (
                      <div className="bg-white rounded-lg p-3 border-2 border-teal-200">
                        <p className="text-gray-600 text-xs mb-1">Body</p>
                        <p className="font-bold text-lg capitalize">{listing.cosmeticCondition.bodyCondition}</p>
                      </div>
                    )}
                    {listing.cosmeticCondition.backCondition && (
                      <div className="bg-white rounded-lg p-3 border-2 border-teal-200">
                        <p className="text-gray-600 text-xs mb-1">Back</p>
                        <p className="font-bold text-lg capitalize">{listing.cosmeticCondition.backCondition}</p>
                      </div>
                    )}
                    {listing.cosmeticCondition.cameraCondition && (
                      <div className="bg-white rounded-lg p-3 border-2 border-teal-200">
                        <p className="text-gray-600 text-xs mb-1">Camera</p>
                        <p className="font-bold text-lg capitalize">{listing.cosmeticCondition.cameraCondition}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Accessories */}
              {listing.accessories && Object.values(listing.accessories).some(val => val) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                  className="card bg-linear-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200"
                >
                  <h2 className="text-xl font-bold mb-4">
                    <span className="mr-2">📦</span>
                    <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Included Accessories
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(listing.accessories)
                      .filter(([, value]) => value)
                      .map(([key]) => {
                        const labels: Record<string, string> = {
                          box: 'Original Box',
                          charger: 'Charger',
                          cable: 'Cable',
                          earphones: 'Earphones',
                          case: 'Case',
                          screenProtector: 'Screen Protector'
                        };
                        return (
                          <div key={key} className="bg-white rounded-lg p-3 border-2 border-indigo-200 flex items-center gap-2">
                            <span className="text-green-600">✅</span>
                            <span className="text-gray-700 font-medium">{labels[key] || key}</span>
                          </div>
                        );
                      })}
                  </div>
                </motion.div>
              )}

              {/* Seller Information */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="card bg-linear-to-br from-pink-50 to-pink-100 border-2 border-pink-200"
              >
                <h2 className="text-xl font-bold mb-4">
                  <span className="mr-2">👤</span>
                  <span className="bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Seller Information
                  </span>
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => navigate(`/profile/${listing.seller._id}`)}
                    className="w-16 h-16 bg-linear-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
                  >
                    {listing.seller.name.charAt(0).toUpperCase()}
                  </button>
                  <div className="flex-1">
                    <button
                      onClick={() => navigate(`/profile/${listing.seller._id}`)}
                      className="font-bold text-lg hover:text-primary-600 transition-colors text-left"
                    >
                      {listing.seller.name}
                    </button>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <span>📍</span> {listing.location.city}
                    </p>
                  </div>
                  {!isOwner && user && (
                    <button
                      onClick={() => {
                        setReportTarget({ type: 'user', id: listing.seller._id, name: listing.seller.name });
                        setShowReportModal(true);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      <span>🚨</span> Report User
                    </button>
                  )}
                </div>

                {!isOwner && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => contactMutation.mutate()}
                    disabled={contactMutation.isPending || !user}
                    className="w-full btn-primary bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 text-lg py-4 rounded-xl font-bold shadow-xl"
                  >
                    {contactMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loading size="sm" />
                        Starting Chat...
                      </span>
                    ) : !user ? (
                      <span className="flex items-center justify-center gap-2">
                        <span>🔒</span> Login to Contact Seller
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>💬</span> Contact Seller
                      </span>
                    )}
                  </motion.button>
                )}

                {isOwner && listing.status === 'active' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMarkAsSold(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg transition-colors mb-3"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>✅</span> Mark as Sold
                    </span>
                  </motion.button>
                )}

                {isOwner && (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/listings/${id}/edit`)}
                      className="flex-1 btn-secondary py-4 rounded-xl font-bold"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>✏️</span> Edit
                      </span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowConfirmDelete(true)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition-colors"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>🗑️</span> Delete
                      </span>
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Delete Listing?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && reportTarget && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
          reportType={reportTarget.type}
          targetId={reportTarget.id}
          targetName={reportTarget.name}
        />
      )}

      {/* Mark as Sold Modal */}
      {showMarkAsSold && (
        <MarkAsSoldModal
          isOpen={showMarkAsSold}
          onClose={() => setShowMarkAsSold(false)}
          listingId={id!}
          listingTitle={listing.title}
        />
      )}
    </div>
  );
}
