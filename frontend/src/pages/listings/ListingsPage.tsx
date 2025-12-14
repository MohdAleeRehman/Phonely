import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { listingService } from '../../services/listing.service';
import type { ListingFilters } from '../../services/listing.service';
import PhoneCard from '../../components/listings/PhoneCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

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

const BRANDS = [
  'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 
  'Huawei', 'Google', 'Nokia', 'Infinix', 'Tecno', 'Honor', 'Motorola',
  'Sony', 'Asus', 'Lenovo', 'ZTE', 'Nothing', 'Other'
];

const CONDITIONS = ['excellent', 'good', 'fair', 'poor'];

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high';

export default function ListingsPage() {
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    limit: 12,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [citySearch, setCitySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [cityFocused, setCityFocused] = useState(false);
  const [brandFocused, setBrandFocused] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingService.getListings(filters),
  });

  const updateFilter = (key: keyof ListingFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
    setSortBy('newest');
    setCitySearch('');
    setBrandSearch('');
  };

  // Filter cities based on search
  const filteredCitiesByProvince = useMemo(() => {
    if (!citySearch) return CITIES_BY_PROVINCE;

    const filtered: Record<string, string[]> = {};
    Object.entries(CITIES_BY_PROVINCE).forEach(([province, cities]) => {
      const matchedCities = cities.filter(city =>
        city.toLowerCase().includes(citySearch.toLowerCase())
      );
      if (matchedCities.length > 0) {
        filtered[province] = matchedCities;
      }
    });
    return filtered;
  }, [citySearch]);

  // Filter brands based on search
  const filteredBrands = useMemo(() => {
    if (!brandSearch) return BRANDS;
    return BRANDS.filter(brand =>
      brand.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brandSearch]);

  // Apply sorting to listings
  const sortedListings = data?.data?.listings ? [...data.data.listings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  }) : [];

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
        <h1 className="text-4xl font-black mb-2 flex items-center gap-2">
  <span>🔍</span>
  <span className="bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
    Browse Phones
  </span>
</h1>

        <p className="text-gray-600 text-lg">
          Find your perfect phone from our AI-verified listings ✨
        </p>
      </div>

      {/* Search Bar with Filter Toggle and Sort */}
      <div className="card mb-6 relative z-10 backdrop-blur-sm bg-white/90">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by phone model..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input-field w-full"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input-field w-full"
            >
              <option value="newest">📅 Newest First</option>
              <option value="oldest">⏰ Oldest First</option>
              <option value="price-low">💰 Price: Low to High</option>
              <option value="price-high">💎 Price: High to Low</option>
            </select>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary sm:w-auto whitespace-nowrap ${showFilters ? 'bg-primary-100 border-primary-400' : ''}`}
          >
            {showFilters ? '✖️ Hide Filters' : '🎛️ Show Filters'}
          </button>
        </div>
      </div>

      {/* Filters Panel (Collapsible) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 1000 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden mb-8 relative z-10"
          >
            <div className="card backdrop-blur-sm bg-white/90">
              <div className="grid md:grid-cols-4 gap-4">

          {/* City Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search or select..."
                value={filters.city || citySearch}
                onChange={(e) => {
                  setCitySearch(e.target.value);
                  updateFilter('city', undefined);
                }}
                onFocus={() => setCityFocused(true)}
                onBlur={() => setTimeout(() => setCityFocused(false), 200)}
                className="input-field w-full"
              />
            </div>
            {cityFocused && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg">
                {Object.keys(filteredCitiesByProvince).length > 0 ? (
                  Object.entries(filteredCitiesByProvince).map(([province, cities]) => (
                    <div key={province}>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">{province}</div>
                      {cities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => { updateFilter('city', city); setCitySearch(''); setCityFocused(false); }}
                          className="w-full text-left px-3 py-2 hover:bg-primary-50 text-sm border-b border-gray-50 last:border-0"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No cities found</div>
                )}
              </div>
            )}
          </div>

          {/* Brand Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search or select..."
                value={filters.brand || brandSearch}
                onChange={(e) => {
                  setBrandSearch(e.target.value);
                  updateFilter('brand', undefined);
                }}
                onFocus={() => setBrandFocused(true)}
                onBlur={() => setTimeout(() => setBrandFocused(false), 200)}
                className="input-field w-full"
              />
            </div>
            {brandFocused && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => { updateFilter('brand', brand); setBrandSearch(''); setBrandFocused(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-primary-50 text-sm border-b border-gray-50 last:border-0"
                    >
                      {brand}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No brands found</div>
                )}
              </div>
            )}
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
                updateFilter('ptaApproved', value === '' ? undefined : value);
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
                    🔄 Clear All Filters
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            📦 Found {data.results || 0} listings {sortBy !== 'newest' && `(sorted by ${sortBy.replace('-', ' ')})`}
          </motion.div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8 relative z-10">
            {sortedListings.map((listing) => (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
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

