import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Package, CheckCircle, Clock, Sparkles } from 'lucide-react';
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
        return 'bg-green-500/20 text-green-300 border border-green-500/50';
      case 'sold':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/50';
      case 'draft':
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/50';
      case 'removed':
        return 'bg-red-500/20 text-red-300 border border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/50';
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-300 mb-4">Please login to view your profile</p>
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
    >      {/* Circuit Pattern Background */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="profileCircuit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'#2563eb',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
          </linearGradient>
          <pattern id="profilePattern" x="0" y="0" width="400" height="300" patternUnits="userSpaceOnUse">
            <path d="M50 0 L50 90 L70 110 L70 200" stroke="url(#profileCircuit)" strokeWidth="2" fill="none"/>
            <path d="M100 0 L100 70 L120 90 L120 180" stroke="url(#profileCircuit)" strokeWidth="2" fill="none"/>
            <path d="M150 0 L150 100 L170 120 L170 220" stroke="url(#profileCircuit)" strokeWidth="2" fill="none"/>
            <circle cx="50" cy="90" r="4" fill="#06b6d4"/>
            <circle cx="100" cy="70" r="4" fill="#7c3aed"/>
            <rect x="116" y="86" width="8" height="8" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#profilePattern)"/>
      </svg>
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
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 mb-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0 relative">
            <div className="h-32 w-32 rounded-full bg-linear-to-br from-cyan-500 to-primary-600 p-1">
              <div className="h-full w-full rounded-full bg-gray-800 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {user.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-linear-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Verified
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-black mb-3 flex items-center gap-2 text-white">
                  <User className="w-8 h-8 text-cyan-400" />
                  <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                    {user.name}
                  </span>
                </h1>
                <div className="space-y-1 text-gray-300">
                  <p className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-cyan-400" />
                    {user.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-cyan-400" />
                    {user.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-cyan-400" />
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
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10 bg-white/5 backdrop-blur-md rounded-lg p-4">
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <p className="text-3xl font-black flex items-center justify-center gap-2">
                  <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                    {listings.length}
                  </span>
                  <Package className="w-7 h-7 text-cyan-400" />
                </p>
                <p className="text-sm text-gray-300 font-medium">Total Listings</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <p className="text-3xl font-black flex items-center justify-center gap-2">
                  <span className="bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    {listings.filter((l) => l.status === 'active').length}
                  </span>
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </p>
                <p className="text-sm text-gray-300 font-medium">Active Listings</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <p className="text-3xl font-black flex items-center justify-center gap-2">
                  <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {listings.reduce((sum, l) => sum + l.views, 0)}
                  </span>
                  <Clock className="w-7 h-7 text-purple-400" />
                </p>
                <p className="text-sm text-gray-300 font-medium">Total Views</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* My Listings Section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black flex items-center gap-2">
            <Package className="w-8 h-8 text-cyan-400" />
            <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              My Listings
            </span>
          </h2>
          <motion.button
            onClick={() => navigate('/listings/create')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-linear-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> Create New Listing
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
            className="text-center py-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg"
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300 mb-4 text-lg">You haven't created any listings yet</p>
            <motion.button
              onClick={() => navigate('/listings/create')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-linear-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-xl hover:shadow-cyan-500/50 transition-all"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              Create Your First Listing
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
                <label className="block text-sm font-medium text-gray-300 mb-1">
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
                <label className="block text-sm font-medium text-gray-300 mb-1 items-center gap-1">
                  <MapPin className="w-4 h-4" /> City
                </label>
                <select
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="input-field"
                >
                  <option value="" className="bg-gray-800 text-gray-300">Select your city</option>
                  {Object.entries(CITIES_BY_PROVINCE).map(([province, cities]) => (
                    <optgroup key={province} label={province} className="bg-gray-800 text-white font-semibold">
                      {cities.map((city) => (
                        <option key={city} value={city} className="bg-gray-800 text-gray-300">
                          {city}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
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
