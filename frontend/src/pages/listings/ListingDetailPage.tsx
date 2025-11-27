import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { listingService } from '../../services/listing.service';
import { chatService } from '../../services/chat.service';
import { useAuthStore } from '../../store/authStore';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
    onSuccess: (chat) => {
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

  const isOwner = user?._id === listing.seller._id;
  
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
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-3xl font-bold">
                    <span className="bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {listing.title}
                    </span>
                  </h1>
                  {listing.inspectionReport && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium border-2 border-green-200"
                    >
                      <span className="text-lg">✅</span>
                      AI Verified
                    </motion.span>
                  )}
                </div>
                <div className="flex items-end gap-4 mb-3">
                  <p className="text-5xl font-bold bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                    PKR {listing.price.toLocaleString()}
                  </p>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${conditionColor} border-2`}>
                    {listing.condition}
                  </span>
                </div>
                {listing.priceRange && (
                  <div className="bg-linear-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">💰 AI Suggested Price Range</p>
                    <p className="text-lg font-bold text-primary-600">
                      PKR {listing.priceRange.min.toLocaleString()} - {listing.priceRange.max.toLocaleString()}
                    </p>
                    {listing.price < listing.priceRange.min && (
                      <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                        <span>🔥</span> Great deal! Below market value
                      </p>
                    )}
                    {listing.price > listing.priceRange.max && (
                      <p className="text-sm text-orange-600 font-medium mt-1 flex items-center gap-1">
                        <span>⚠️</span> Above suggested price range
                      </p>
                    )}
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

              {/* AI Inspection Report */}
              {listing.inspectionReport && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200"
                >
                  <h2 className="text-xl font-bold mb-4">
                    <span className="mr-2">🤖</span>
                    <span className="bg-linear-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      AI Inspection Report
                    </span>
                  </h2>
                  
                  <div className="grid gap-4">
                    {/* Condition Score */}
                    <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">📊 Condition Score</span>
                        <span className="text-2xl font-bold text-primary-600">{listing.inspectionReport.conditionScore}/10</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(listing.inspectionReport.conditionScore / 10) * 100}%` }}
                          transition={{ delay: 0.7, duration: 1 }}
                          className="h-full bg-linear-to-r from-primary-500 to-purple-500"
                        />
                      </div>
                    </div>

                    {/* Authenticity Score */}
                    <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">🔒 Authenticity</span>
                        <span className="text-2xl font-bold text-green-600">{listing.inspectionReport.authenticityScore}/100</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${listing.inspectionReport.authenticityScore}%` }}
                          transition={{ delay: 0.9, duration: 1 }}
                          className="h-full bg-linear-to-r from-green-500 to-teal-500"
                        />
                      </div>
                    </div>

                    {/* Detected Issues */}
                    {listing.inspectionReport.detectedIssues && listing.inspectionReport.detectedIssues.length > 0 && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                        <p className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                          <span>⚠️</span> Detected Issues:
                        </p>
                        <ul className="space-y-2">
                          {listing.inspectionReport.detectedIssues.map((issue, index) => (
                            <li key={index} className="text-sm flex items-start gap-2 bg-white rounded-lg p-2 border border-yellow-200">
                              <span className="text-yellow-600 mt-0.5">•</span>
                              <span className="text-gray-700">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
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
              {listing.accessories && listing.accessories.length > 0 && (
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
                    {listing.accessories.map((accessory: string, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border-2 border-indigo-200 flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-gray-700 font-medium">{accessory}</span>
                      </div>
                    ))}
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
                  <div className="w-16 h-16 bg-linear-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                    {listing.seller.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{listing.seller.name}</p>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <span>📍</span> {listing.location.city}
                    </p>
                  </div>
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
    </div>
  );
}
