import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Smartphone, CheckCircle2, MessageSquare, AlertTriangle, AlertCircle, FileText, Package, Edit, Trash2, Shield, Sparkles, X, Zap, MapPin, Lock, Battery, Wrench, AlertCircle as AlertCircleIcon, Bot, ChevronLeft, ChevronRight, User } from 'lucide-react';
import PKRIcon from '../../components/icons/PKRIcon';
import { listingService } from '../../services/listing.service';
import { chatService } from '../../services/chat.service';
import { useAuthStore } from '../../store/authStore';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import ReportModal from '../../components/common/ReportModal';
import AIInspectionReport from '../../components/listings/AIInspectionReport';
import { MarkAsSoldModal } from '../../components/listing/MarkAsSoldModal';
import CircuitPattern from '../../components/common/CircuitPattern';

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
  
  // Swipe gesture handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  const minSwipeDistance = 50;

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

  // Swipe gesture handlers - defined after listing is available
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !listing) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && listing.images.length > 1) {
      setSelectedImage((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe && listing.images.length > 1) {
      setSelectedImage((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
    }
  };

  // Check ownership - handle both _id and id fields, and seller as object or string
  const userId = user?._id || user?.id;
  const sellerId = typeof listing.seller === 'object' ? (listing.seller._id || listing.seller.id) : listing.seller;
  const isOwner = userId === sellerId;
  
  const imageTypeLabels: Record<string, string> = {
    'front': 'Front',
    'back': 'Back',
    'left-side': 'Left',
    'right-side': 'Right',
    'top': 'Top',
    'bottom': 'Bottom',
    'front-camera-on': 'Selfie',
    'back-camera-on': 'Camera',
    'display-test': 'Display',
    'screen': 'Screen',
    'accessories': 'Box',
    'other': 'Photo',
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
    excellent: 'bg-green-500/20 text-green-300 border-green-500/50',
    good: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    fair: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    poor: 'bg-red-500/20 text-red-300 border-red-500/50',
  }[listing.condition || 'good'];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-950 to-gray-900 relative overflow-hidden">
      <CircuitPattern />
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
              <div 
                className="aspect-square bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden relative shadow-xl border-4 border-white/10 touch-pan-y"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {listing.images.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(listing.images[selectedImage])}
                      alt={listing.title}
                      className="w-full h-full object-cover select-none"
                      draggable={false}
                    />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-semibold text-white shadow-xl border border-white/20">
                      {getImageType(listing.images[selectedImage], selectedImage)}
                    </div>
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-xl border border-white/20">
                      {selectedImage + 1} / {listing.images.length}
                    </div>

                    {/* Navigation Arrows */}
                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full shadow-lg transition-all hover:scale-110 border-2 border-white/30 hidden md:block"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full shadow-lg transition-all hover:scale-110 border-2 border-white/30 hidden md:block"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Smartphone className="w-16 h-16" />
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
                          ? 'w-8 h-2 bg-cyan-500'
                          : 'w-2 h-2 bg-gray-500 hover:bg-gray-400'
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
              <div className="card bg-linear-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-md border-2 border-cyan-400/30">
                <div className="flex flex-col gap-3 mb-4">
                  <h1 className="text-4xl font-bold text-white leading-tight">
                    <span className="bg-linear-to-r from-cyan-400 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {listing.title}
                    </span>
                  </h1>
                  {listing.inspectionReport && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="flex items-center gap-2 text-base text-green-300 bg-green-500/20 px-4 py-2 rounded-full font-semibold border-2 border-green-400/50 w-fit backdrop-blur-md"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      AI Verified
                    </motion.span>
                  )}
                </div>
                <div className="flex items-end gap-3 mb-4 flex-wrap">
                  <p className="text-5xl font-bold bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                    PKR {listing.price.toLocaleString()}
                  </p>
                  <span className={`px-5 py-2.5 rounded-full text-base font-bold ${conditionColor} border-2 capitalize`}>
                    {listing.condition}
                  </span>
                  {listing.priceNegotiable && (
                    <span className="px-5 py-2.5 rounded-full text-base font-bold bg-blue-500/20 text-blue-300 border-2 border-blue-400/50 backdrop-blur-md flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Negotiable
                    </span>
                  )}
                  {listing.ptaApproved && (
                    <span className="px-5 py-2.5 rounded-full text-base font-bold bg-green-500/20 text-green-300 border-2 border-green-400/50 backdrop-blur-md flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      PTA Approved
                    </span>
                  )}
                  {!listing.ptaApproved && (
                    <span className="px-5 py-2.5 rounded-full text-base font-bold bg-red-500/20 text-red-300 border-2 border-red-400/50 backdrop-blur-md flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Non-PTA
                    </span>
                  )}
                </div>
                {listing.priceRange && (
                  <div className="bg-linear-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/40 rounded-xl p-4 backdrop-blur-md">
                    <p className="text-base font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <PKRIcon className="w-5 h-5 text-cyan-400" />
                      AI Suggested Price Range
                    </p>
                    <p className="text-2xl font-bold text-cyan-300">
                      PKR {listing.priceRange.min.toLocaleString()} - {listing.priceRange.max.toLocaleString()}
                    </p>
                    {listing.price < listing.priceRange.min && (
                      <p className="text-base text-green-300 font-semibold mt-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        Great deal! Below market value
                      </p>
                    )}
                    {listing.price > listing.priceRange.max && (
                      <p className="text-base text-orange-300 font-semibold mt-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Above suggested price range
                      </p>
                    )}
                  </div>
                )}

                {/* Report Listing Button - Only show if not owner and user is logged in */}
                {!isOwner && user && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        setReportTarget({ type: 'listing', id: listing._id, name: listing.title });
                        setShowReportModal(true);
                      }}
                      className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Report this listing
                    </button>
                  </div>
                )}
              </div>

              {/* AI Inspection Report */}
              {listing.inspectionReport && (() => {
                // Extract reportId - handle string, object with _id, or object with $oid
                let reportId: string | null = null;
                const reportIdValue = listing.inspectionReport.reportId;
                
                if (typeof reportIdValue === 'string') {
                  reportId = reportIdValue;
                } else if (reportIdValue && typeof reportIdValue === 'object') {
                  // Handle populated object or MongoDB $oid format
                  const reportIdObj = reportIdValue as { _id?: string; $oid?: string; id?: string };
                  reportId = reportIdObj._id || reportIdObj.$oid || reportIdObj.id || null;
                  // Convert to string if it's an ObjectId
                  if (reportId && typeof reportId !== 'string') {
                    reportId = String(reportId);
                  }
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {reportId ? (
                      <AIInspectionReport 
                        inspectionId={reportId} 
                        listingPrice={listing.price}
                      />
                    ) : (
                      <div className="card bg-linear-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 backdrop-blur-sm">
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <Bot className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                            <p className="text-gray-300 text-lg font-semibold mb-2">AI Inspection in Progress</p>
                            <p className="text-gray-400 text-sm">The inspection report is being generated. Please check back shortly.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })()}

              {/* Phone Specifications */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="card bg-linear-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-md border-2 border-blue-400/30"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-cyan-400" />
                  <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Specifications
                  </span>
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
                    <p className="text-gray-300 text-xs mb-1">Brand</p>
                    <p className="font-bold text-lg text-white">{listing.phone.brand}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
                    <p className="text-gray-300 text-xs mb-1">Model</p>
                    <p className="font-bold text-lg text-white">{listing.phone.model}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
                    <p className="text-gray-300 text-xs mb-1">Storage</p>
                    <p className="font-bold text-lg text-white">{listing.phone.storage}</p>
                  </div>
                  {listing.phone.ram && (
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
                      <p className="text-gray-300 text-xs mb-1">RAM</p>
                      <p className="font-bold text-lg text-white">{listing.phone.ram}</p>
                    </div>
                  )}
                  {listing.phone.color && (
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
                      <p className="text-gray-300 text-xs mb-1">Color</p>
                      <p className="font-bold text-lg text-white">{listing.phone.color}</p>
                    </div>
                  )}
                  {listing.phone.imei && (
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 col-span-2">
                      <p className="text-gray-300 text-xs mb-1">IMEI</p>
                      <p className="font-bold text-sm font-mono text-white">{listing.phone.imei}</p>
                    </div>
                  )}
                  <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
                    <p className="text-gray-300 text-xs mb-1">Warranty</p>
                    <p className="font-bold text-lg flex items-center gap-2">
                      {listing.phone.warranty?.hasWarranty ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          Yes
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-red-400" />
                          No
                        </>
                      )}
                      {listing.phone.warranty?.hasWarranty && listing.phone.warranty.type && (
                        <span className="text-sm font-normal text-gray-300 ml-2">({listing.phone.warranty.type})</span>
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
                  className="card bg-linear-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-md border-2 border-emerald-400/30"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Warranty Information
                    </span>
                  </h2>
                  <div className="space-y-3">
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-emerald-500/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 text-sm mb-1">Warranty Type</p>
                          <p className="font-bold text-lg capitalize text-white">{listing.phone.warranty.type}</p>
                        </div>
                        <div className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-emerald-500/50">
                          Active
                        </div>
                      </div>
                    </div>
                    {listing.phone.warranty.expiryDate && (
                      <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-emerald-500/50">
                        <p className="text-gray-300 text-sm mb-1">Valid Until</p>
                          <p className="font-bold text-lg text-white">
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
                  className="card bg-linear-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-md border-2 border-purple-400/30"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Battery className="w-6 h-6 text-purple-400" />
                    <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Device Condition
                    </span>
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Battery Health - Apple Only */}
                    {listing.phone?.brand === 'Apple' && listing.conditionDetails?.batteryHealth && (
                      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border-2 border-purple-500/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-200 font-medium flex items-center gap-2">
                            <Battery className="w-4 h-4 text-cyan-400" />
                            Battery Health
                          </span>
                          <span className={`text-2xl font-bold ${
                            listing.conditionDetails.batteryHealth >= 80 ? 'text-green-400' :
                            listing.conditionDetails.batteryHealth >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {listing.conditionDetails.batteryHealth}%
                          </span>
                        </div>
                        <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden">
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
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          {listing.conditionDetails.batteryHealth >= 80 ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                              Excellent battery condition
                            </>
                          ) : listing.conditionDetails.batteryHealth >= 60 ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-yellow-400" />
                              Battery showing wear
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              Consider battery replacement
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Screen Condition */}
                    {listing.conditionDetails?.screenCondition && (
                      <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-purple-500/50">
                        <p className="text-gray-300 text-sm mb-1 flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-cyan-400" />
                          Screen Condition
                        </p>
                        <p className="font-bold text-lg capitalize text-white">{listing.conditionDetails.screenCondition}</p>
                      </div>
                    )}

                    {/* Body Condition */}
                    {listing.conditionDetails?.bodyCondition && (
                      <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-purple-500/50">
                        <p className="text-gray-300 text-sm mb-1 flex items-center gap-2">
                          <Package className="w-4 h-4 text-cyan-400" />
                          Body Condition
                        </p>
                        <p className="font-bold text-lg capitalize text-white">{listing.conditionDetails.bodyCondition}</p>
                      </div>
                    )}

                    {/* Display Quality */}
                    {listing.conditionDetails?.displayQuality && (
                      <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-purple-500/50">
                        <p className="text-gray-300 text-sm mb-1 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          Display Quality
                        </p>
                        <p className="font-bold text-lg capitalize flex items-center gap-2">
                          {listing.conditionDetails.displayQuality === 'flawless' && (
                            <>
                              <Sparkles className="w-5 h-5 text-cyan-400" />
                              Flawless
                            </>
                          )}
                          {listing.conditionDetails.displayQuality === 'minor-scratches' && (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                              Minor Scratches
                            </>
                          )}
                          {listing.conditionDetails.displayQuality === 'noticeable-wear' && (
                            <>
                              <AlertTriangle className="w-5 h-5 text-yellow-400" />
                              Noticeable Wear
                            </>
                          )}
                          {listing.conditionDetails.displayQuality === 'cracked' && (
                            <>
                              <X className="w-5 h-5 text-red-400" />
                              Cracked
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    {/* All Features Working */}
                    {listing.conditionDetails?.allFeaturesWorking !== undefined && (
                      <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-purple-500/50">
                        <p className="text-gray-300 text-sm mb-1 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-cyan-400" />
                          Functionality Status
                        </p>
                        <p className={`font-bold text-lg flex items-center gap-2 ${listing.conditionDetails.allFeaturesWorking ? 'text-green-400' : 'text-orange-400'}`}>
                          {listing.conditionDetails.allFeaturesWorking ? (
                            <>
                              <CheckCircle2 className="w-5 h-5" />
                              All Features Working
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-5 h-5" />
                              Some Issues Present
                            </>
                          )}
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
                  className="card bg-linear-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-md border-2 border-orange-400/30"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                    <span className="bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Known Issues
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {listing.conditionDetails.functionalIssues.map((issue, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-orange-500/50 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                        <span className="text-gray-200 font-medium">{issue}</span>
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
                  className="card bg-linear-to-br from-white/5 to-white/10 backdrop-blur-md border-2 border-white/10"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-cyan-400" />
                    <span className="bg-linear-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                      Additional Notes
                    </span>
                  </h2>
                  <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                    <p className="text-gray-200 whitespace-pre-wrap">{listing.conditionDetails.additionalNotes}</p>
                  </div>
                </motion.div>
              )}

              {/* Description */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card bg-linear-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-md border-2 border-purple-400/30"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Description
                  </span>
                </h2>
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </motion.div>

              {/* Functionality Issues */}
              {listing.functionalityIssues && listing.functionalityIssues.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="card bg-linear-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-md border-2 border-orange-400/30"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                    <span className="bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Functionality Issues
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {listing.functionalityIssues.map((issue: string, index: number) => (
                      <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-orange-500/50 flex items-center gap-2">
                        <X className="w-5 h-5 text-orange-400" />
                        <span className="text-gray-200 font-medium">{issue}</span>
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
                  className="card bg-linear-to-br from-red-500/10 to-red-600/10 backdrop-blur-md border-2 border-red-400/30"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircleIcon className="w-6 h-6 text-red-400" />
                    <span className="bg-linear-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Physical Damage
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {listing.physicalDamage.map((damage: string, index: number) => (
                      <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-red-500/50 flex items-center gap-2">
                        <AlertCircleIcon className="w-5 h-5 text-red-400" />
                        <span className="text-gray-200 font-medium">{damage}</span>
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
                  className="card bg-linear-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-md border-2 border-yellow-400/30"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-yellow-400" />
                    <span className="bg-linear-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      Repair History
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {listing.repairHistory.map((repair: string, index: number) => (
                      <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-yellow-500/50 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-200 font-medium">{repair}</span>
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
                  className="card bg-linear-to-br from-teal-500/10 to-teal-600/10 backdrop-blur-md border-2 border-teal-400/30"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-teal-400" />
                    <span className="bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Cosmetic Condition
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {listing.cosmeticCondition.screenCondition && (
                      <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-teal-500/50">
                        <p className="text-gray-300 text-xs mb-1">Screen</p>
                        <p className="font-bold text-lg capitalize text-white">{listing.cosmeticCondition.screenCondition}</p>
                      </div>
                    )}
                    {listing.cosmeticCondition.bodyCondition && (
                      <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-teal-500/50">
                        <p className="text-gray-300 text-xs mb-1">Body</p>
                        <p className="font-bold text-lg capitalize text-white">{listing.cosmeticCondition.bodyCondition}</p>
                      </div>
                    )}
                    {listing.cosmeticCondition.backCondition && (
                      <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-teal-500/50">
                        <p className="text-gray-300 text-xs mb-1">Back</p>
                        <p className="font-bold text-lg capitalize text-white">{listing.cosmeticCondition.backCondition}</p>
                      </div>
                    )}
                    {listing.cosmeticCondition.cameraCondition && (
                      <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-teal-500/50">
                        <p className="text-gray-300 text-xs mb-1">Camera</p>
                        <p className="font-bold text-lg capitalize text-white">{listing.cosmeticCondition.cameraCondition}</p>
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
                  className="card bg-linear-to-br from-indigo-500/10 to-indigo-600/10 backdrop-blur-md border-2 border-indigo-400/30"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Package className="w-6 h-6 text-indigo-400" />
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
                          <div key={key} className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-indigo-500/50 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span className="text-gray-200 font-medium">{labels[key] || key}</span>
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
                className="card bg-linear-to-br from-pink-500/10 to-pink-600/10 backdrop-blur-md border-2 border-pink-400/30"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-pink-400" />
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
                      className="font-bold text-lg hover:text-cyan-400 transition-colors text-left"
                    >
                      {listing.seller.name}
                    </button>
                    <p className="text-gray-300 text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing.location.city}
                    </p>
                  </div>
                  {!isOwner && user && (
                    <button
                      onClick={() => {
                        setReportTarget({ type: 'user', id: listing.seller._id, name: listing.seller.name });
                        setShowReportModal(true);
                      }}
                      className="text-sm text-red-300 hover:text-red-200 font-medium flex items-center gap-1 px-3 py-2 rounded-lg border border-red-500/50 hover:bg-red-500/20 transition-colors backdrop-blur-sm"
                    >
                      <Shield className="w-4 h-4" />
                      Report User
                    </button>
                  )}
                </div>

                {!isOwner && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => contactMutation.mutate()}
                    disabled={contactMutation.isPending || !user}
                    className="w-full bg-linear-to-r from-cyan-500 via-purple-600 to-pink-600 text-white text-lg py-4 rounded-xl font-bold shadow-xl hover:shadow-cyan-500/50 transition-all"
                  >
                    {contactMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loading size="sm" />
                        Starting Chat...
                      </span>
                    ) : !user ? (
                      <span className="flex items-center justify-center gap-2">
                        <Lock className="w-5 h-5" />
                        Login to Contact Seller
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Contact Seller
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
                      <CheckCircle2 className="w-5 h-5" />
                      Mark as Sold
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
                        <Edit className="w-5 h-5" />
                        Edit
                      </span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowConfirmDelete(true)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition-colors"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Delete
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
            <p className="text-gray-300 mb-6">
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
