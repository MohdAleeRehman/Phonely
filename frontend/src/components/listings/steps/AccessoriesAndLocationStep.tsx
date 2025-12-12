import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ButtonCard } from '../../common/ButtonCard';

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

interface AccessoriesAndLocationStepProps {
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
}

export default function AccessoriesAndLocationStep({
  register,
  errors,
  watch,
  setValue,
}: AccessoriesAndLocationStepProps) {
  const [citySearch, setCitySearch] = useState('');
  const [cityFocused, setCityFocused] = useState(false);

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

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-8"
    >
      {/* Accessories Section */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          <span className="mr-3">📦</span>
          What's Included?
        </h2>
        <p className="text-gray-600 mb-6">Select what comes with your device</p>

        <div className="grid md:grid-cols-3 gap-4">
          <ButtonCard
            icon="📦"
            label="Complete Box"
            selected={watch('accessories') === 'complete-box'}
            onClick={() => setValue('accessories', 'complete-box')}
          />
          <ButtonCard
            icon="🔗"
            label="Cable Only"
            selected={watch('accessories') === 'cable-only'}
            onClick={() => setValue('accessories', 'cable-only')}
          />
          <ButtonCard
            icon="📱"
            label="Device Only"
            selected={watch('accessories') === 'device-only'}
            onClick={() => setValue('accessories', 'device-only')}
          />
        </div>
        <p className="text-xs text-gray-500 mt-3">
          💡 Note: Most manufacturers no longer include charging adapters with new phones
        </p>
      </div>

      {/* Location Section */}
      <div className="border-t-2 border-gray-200 pt-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          <span className="mr-3">📍</span>
          Location
        </h2>
        <p className="text-gray-600 mb-6">Where are you located?</p>

        <div className="space-y-4">
          {/* City */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              City *
            </label>
            
            {/* Hidden input for form registration */}
            <input type="hidden" {...register('city')} />
            
            {/* Search input (not part of form) */}
            <input
              type="text"
              placeholder="🔍 Search or select city..."
              value={(watch('city') as string) || citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setValue('city', '');
              }}
              onFocus={() => setCityFocused(true)}
              onBlur={() => setTimeout(() => setCityFocused(false), 200)}
              className="input-field"
            />
            
            {/* Dropdown */}
            {cityFocused && (
              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto border-2 border-gray-300 rounded-lg bg-white shadow-lg">
                {Object.keys(filteredCitiesByProvince).length > 0 ? (
                  Object.entries(filteredCitiesByProvince).map(([province, cities]) => (
                    <div key={province}>
                      <div className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-50 sticky top-0 border-b">
                        {province}
                      </div>
                      {cities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => { 
                            setValue('city', city); 
                            setCitySearch(''); 
                            setCityFocused(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-primary-50 text-sm border-b border-gray-100 last:border-0 transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">No cities found matching "{citySearch}"</div>
                )}
              </div>
            )}
            
            {errors.city && (
              <p className="text-red-600 text-sm mt-1">{errors.city.message as string}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Address / Area *
            </label>
            <input
              {...register('address')}
              className="input-field"
              placeholder="Street address or area (e.g., DHA Phase 5, Gulberg)"
            />
            {errors.address && (
              <p className="text-red-600 text-sm mt-1">{errors.address.message as string}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              🔒 Your exact address will only be shared after you accept a buyer's request
            </p>
          </div>
        </div>
      </div>

      {/* Summary Info Box */}
      <div className="border-t-2 border-gray-200 pt-8">
        <div className="p-6 bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                Almost Ready to List!
              </h3>
              <p className="text-sm text-green-800 mb-3">
                You're one step away from getting your phone listed. Our AI will verify your listing and suggest the best price!
              </p>
              <div className="flex items-center gap-2 text-xs text-green-700">
                <span>✨ AI Verification</span>
                <span>•</span>
                <span>💰 Price Suggestion</span>
                <span>•</span>
                <span>🚀 Instant Listing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
