import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { listingService } from '../../services/listing.service';
import type { ListingFilters } from '../../services/listing.service';
import PhoneCard from '../../components/listings/PhoneCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'];
const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Oppo', 'Vivo', 'Realme'];
const CONDITIONS = ['excellent', 'good', 'fair', 'poor'];

export default function ListingsPage() {
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    limit: 12,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingService.getListings(filters),
  });

  const updateFilter = (key: keyof ListingFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative"
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 -left-32 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute top-60 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 60, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
          className="absolute bottom-10 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      {/* Header */}
      <div className="mb-8 relative z-10">
        <h1 className="text-4xl font-black bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2 flex items-center gap-2">
          🔍 Browse Phones
        </h1>
        <p className="text-gray-600 text-lg">
          Find your perfect phone from our AI-verified listings ✨
        </p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8 relative z-10 backdrop-blur-sm bg-white/90"
      >
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="Search by phone model..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input-field"
            />
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              value={filters.city || ''}
              onChange={(e) => updateFilter('city', e.target.value)}
              className="input-field"
            >
              <option value="">All Cities</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              value={filters.brand || ''}
              onChange={(e) => updateFilter('brand', e.target.value)}
              className="input-field"
            >
              <option value="">All Brands</option>
              {BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              value={filters.condition || ''}
              onChange={(e) => updateFilter('condition', e.target.value)}
              className="input-field"
            >
              <option value="">All Conditions</option>
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* PTA Approval Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PTA Status
            </label>
            <select
              value={filters.ptaApproved === undefined ? '' : filters.ptaApproved ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value;
                updateFilter('ptaApproved', value === '' ? undefined : value === 'true');
              }}
              className="input-field"
            >
              <option value="">All Phones</option>
              <option value="true">✅ PTA Approved</option>
              <option value="false">⚠️ Non-PTA</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="md:col-span-2 flex items-end">
            <motion.button
              onClick={clearFilters}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary w-full"
            >
              🔄 Clear Filters
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage
          message="Failed to load listings. Please try again."
          onRetry={() => refetch()}
        />
      ) : data?.data?.listings && data.data.listings.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-sm text-gray-600 font-medium"
          >
            📦 Found {data.results || 0} listings
          </motion.div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8 relative z-10">
            {data.data.listings.map((listing, index) => (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PhoneCard listing={listing} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {data.data.pagination && data.data.pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center gap-2 relative z-10"
            >
              <motion.button
                onClick={() => updateFilter('page', (filters.page || 1) - 1)}
                disabled={filters.page === 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⬅️ Previous
              </motion.button>
              <span className="px-4 py-2 text-gray-700 font-medium flex items-center">
                Page {filters.page || 1} of {data.data.pagination.totalPages}
              </span>
              <motion.button
                onClick={() => updateFilter('page', (filters.page || 1) + 1)}
                disabled={filters.page === data.data.pagination.totalPages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next ➡️
              </motion.button>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 card bg-linear-to-br from-primary-50 to-purple-50 relative z-10"
        >
          <div className="text-6xl mb-4">📱</div>
          <p className="text-gray-600 text-lg mb-4">No listings found matching your criteria</p>
          <motion.button
            onClick={clearFilters}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary mt-4"
          >
            🔄 Clear Filters
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

