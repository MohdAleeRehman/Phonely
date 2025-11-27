import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { listingService } from '../services/listing.service';
import { useAuthStore } from '../store/authStore';
import PhoneCard from '../components/listings/PhoneCard';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

// Complete Cities of Pakistan organized by Province
const CITIES_BY_PROVINCE = {
  Punjab: [
    'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 
    'Bahawalpur', 'Sargodha', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 
    'Gujrat', 'Kasur', 'Sahiwal', 'Okara', 'Wah Cantonment', 'Dera Ghazi Khan',
    'Mirpur Khas', 'Kamoke', 'Mandi Burewala', 'Jhelum', 'Sadiqabad',
    'Khanewal', 'Hafizabad', 'Muzaffargarh', 'Khanpur', 'Chiniot', 'Attock'
  ],
  Sindh: [
    'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas',
    'Jacobabad', 'Shikarpur', 'Khairpur', 'Dadu', 'Ghotki', 'Badin',
    'Thatta', 'Tando Adam', 'Tando Allahyar', 'Umerkot', 'Sanghar'
  ],
  'Khyber Pakhtunkhwa': [
    'Peshawar', 'Mardan', 'Abbottabad', 'Mingora', 'Kohat', 'Dera Ismail Khan',
    'Swabi', 'Charsadda', 'Nowshera', 'Mansehra', 'Bannu', 'Haripur',
    'Karak', 'Swat', 'Malakand', 'Dir', 'Chitral', 'Hangu'
  ],
  Balochistan: [
    'Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Chaman', 'Gwadar', 'Sibi',
    'Zhob', 'Loralai', 'Dera Murad Jamali', 'Mastung', 'Kalat', 'Nushki'
  ],
  'Islamabad Capital Territory': ['Islamabad'],
  'Azad Jammu & Kashmir': [
    'Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli', 'Bhimber', 'Bagh'
  ],
  'Gilgit-Baltistan': [
    'Gilgit', 'Skardu', 'Hunza', 'Ghanche', 'Diamir', 'Ghizer'
  ]
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    city: user?.city || '',
    avatar: user?.avatar || '',
  });

  // Fetch user's listings
  const { data: listingsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['myListings'],
    queryFn: listingService.getMyListings,
  });

  // Note: getMyListings returns data directly as array, not data.listings
  const listings = (Array.isArray(listingsResponse?.data) ? listingsResponse.data : listingsResponse?.data?.listings) || [];

  // Delete listing mutation
  const deleteMutation = useMutation({
    mutationFn: listingService.deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteListing = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-600 mb-4">Please login to view your profile</p>
        <button onClick={() => navigate('/login')} className="btn-primary">
          Login
        </button>
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
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 -left-20 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-40 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
      </div>

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {user.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.city || 'Location not set'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-secondary"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-primary-100 bg-linear-to-r from-primary-50 to-purple-50 rounded-lg p-4">
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <p className="text-3xl font-black flex items-center justify-center gap-2">
                  <span className="bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    {listings.length}
                  </span>
                  <span>📦</span>
                </p>
                <p className="text-sm text-gray-600 font-medium">Total Listings</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <p className="text-3xl font-black flex items-center justify-center gap-2">
                  <span className="bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    {listings.filter((l) => l.status === 'active').length}
                  </span>
                  <span>✨</span>
                </p>
                <p className="text-sm text-gray-600 font-medium">Active Listings</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <p className="text-3xl font-black flex items-center justify-center gap-2">
                  <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {listings.reduce((sum, l) => sum + l.views, 0)}
                  </span>
                  <span>👀</span>
                </p>
                <p className="text-sm text-gray-600 font-medium">Total Views</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* My Listings Section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black flex items-center gap-2">
            <span>📱</span>
            <span className="bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              My Listings
            </span>
          </h2>
          <motion.button
            onClick={() => navigate('/listings/create')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-linear-to-r from-primary-600 to-primary-800 text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all flex items-center gap-2"
          >
            ✨ Create New Listing
          </motion.button>
        </div>

        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message="Failed to load your listings" onRetry={refetch} />
        ) : listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, index) => (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Status Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                </div>

                {/* Phone Card */}
                <PhoneCard listing={listing} />

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                  <motion.button
                    onClick={() => navigate(`/listings/${listing._id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex-1 text-sm"
                  >
                    View
                  </motion.button>
                  <motion.button
                    onClick={() => navigate(`/listings/${listing._id}/edit`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex-1 text-sm"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteListing(listing._id)}
                    disabled={deleteMutation.isPending}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? '...' : 'Delete'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 card bg-linear-to-br from-primary-50 to-purple-50"
          >
            <div className="text-6xl mb-4">📱</div>
            <p className="text-gray-600 mb-4 text-lg">You haven't created any listings yet</p>
            <motion.button
              onClick={() => navigate('/listings/create')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-linear-to-r from-primary-600 to-primary-800 text-white px-8 py-3 rounded-full font-bold hover:shadow-xl transition-all"
            >
              ✨ Create Your First Listing
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card max-w-md w-full"
          >
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📍 City
                </label>
                <select
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select your city</option>
                  {Object.entries(CITIES_BY_PROVINCE).map(([province, cities]) => (
                    <optgroup key={province} label={province}>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL (optional)
                </label>
                <input
                  type="text"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement profile update API call
                  console.log('Update profile:', editForm);
                  setShowEditModal(false);
                }}
                className="btn-primary flex-1"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
