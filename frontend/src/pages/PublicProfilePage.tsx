import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import PhoneCard from '../components/listings/PhoneCard';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import ReportModal from '../components/common/ReportModal';
import RatingDisplay from '../components/common/RatingDisplay';
import type { Listing } from '../types';

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch user profile
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data.data.user;
    },
    enabled: !!userId,
  });

  // Fetch user's listings
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['user-listings', userId],
    queryFn: async () => {
      const response = await api.get(`/listings?seller=${userId}&status=active`);
      return response.data.data.listings;
    },
    enabled: !!userId,
  });

  // Fetch user's ratings
  const { data: ratingsData, isLoading: ratingsLoading } = useQuery({
    queryKey: ['user-ratings', userId],
    queryFn: async () => {
      const response = await api.get(`/ratings/user/${userId}?limit=5`);
      return response.data.data;
    },
    enabled: !!userId,
  });

  // Calculate months active after data is loaded
  const monthsActive = useMemo(() => {
    if (!userData?.createdAt) return 0;
    const now = new Date();
    const createdAt = new Date(userData.createdAt);
    return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }, [userData]);

  // Redirect if trying to view own profile
  useEffect(() => {
    if (currentUser && userId && (currentUser._id === userId || currentUser.id === userId)) {
      navigate('/profile');
    }
  }, [currentUser, userId, navigate]);

  const user = userData;
  const listings = listingsData || [];
  const ratings = ratingsData?.ratings || [];
  const ratingsPagination = ratingsData?.pagination;

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (userError || !userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ErrorMessage message="User not found" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative"
    >
      {/* Profile Header */}
      <div className="card mb-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0 relative">
            <div className="h-32 w-32 rounded-full bg-linear-to-br from-primary-500 to-primary-700 p-1">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-primary-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {user.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-linear-to-r from-primary-600 to-primary-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                ✓ Verified
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-black mb-3 flex items-center gap-2">
                  <span>👤</span>
                  <span className="bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    {user.name}
                  </span>
                </h1>
                <div className="space-y-1 text-gray-600">
                  <p className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.city || 'Location not set'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Report Button */}
              {currentUser && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                >
                  <span>🚨</span> Report User
                </button>
              )}
            </div>

            {/* Rating */}
            <div className="mb-4">
              <RatingDisplay
                rating={user.ratings?.average || 0}
                count={user.ratings?.count || 0}
                size="lg"
              />
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-primary-100 bg-linear-to-r from-primary-50 to-purple-50 rounded-lg p-4">
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <p className="text-3xl font-black flex items-center justify-center gap-2">
                  <span className="bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    {listings.length}
                  </span>
                </p>
                <p className="text-sm text-gray-600 font-medium mt-1">Active Listings</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <p className="text-3xl font-black flex items-center justify-center gap-2">
                  <span className="bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    {user.isVerified ? '✓' : '✗'}
                  </span>
                </p>
                <p className="text-sm text-gray-600 font-medium mt-1">Verified</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <p className="text-3xl font-black flex items-center justify-center gap-2">
                  <span className="bg-linear-to-r from-purple-600 to-pink-800 bg-clip-text text-transparent">
                    {monthsActive}
                  </span>
                </p>
                <p className="text-sm text-gray-600 font-medium mt-1">Months Active</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Listings */}
      <div>
        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
          <span>📱</span>
          <span className="bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Active Listings
          </span>
        </h2>

        {listingsLoading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing: Listing) => (
              <PhoneCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-12"
          >
            <div className="text-6xl mb-4">📱</div>
            <p className="text-xl font-medium text-gray-600">No active listings</p>
            <p className="text-sm text-gray-500 mt-2">This user hasn't posted any listings yet</p>
          </motion.div>
        )}
      </div>

      {/* Ratings Section */}
      {user.ratings?.count > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-6">
            <span className="bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Recent Reviews
            </span>
          </h2>

          {ratingsLoading ? (
            <div className="flex justify-center py-12">
              <Loading />
            </div>
          ) : ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating: { _id: string; rater: { avatar?: string; name: string }; createdAt: string; rating: number; review?: string; listing?: { title: string } }) => (
                <motion.div
                  key={rating._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                >
                  <div className="flex items-start gap-4">
                    {/* Rater Avatar */}
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      {rating.rater?.avatar ? (
                        <img
                          src={rating.rater.avatar}
                          alt={rating.rater.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary-600">
                          {rating.rater?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{rating.rater?.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(rating.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <RatingDisplay rating={rating.rating} size="sm" showCount={false} />
                      </div>

                      {/* Review Text */}
                      {rating.review && (
                        <p className="text-gray-700 mb-2">{rating.review}</p>
                      )}

                      {/* Listing Info */}
                      {rating.listing && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>About: {rating.listing.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* View More */}
              {ratingsPagination && ratingsPagination.pages > 1 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Showing {ratings.length} of {ratingsPagination.total} reviews
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType="user"
          targetId={userId!}
          targetName={user.name}
        />
      )}
    </motion.div>
  );
}
