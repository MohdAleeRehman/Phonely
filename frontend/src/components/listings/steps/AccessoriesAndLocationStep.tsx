import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Package, Link2, Smartphone, MapPin, Search, Lightbulb, Sparkles, Rocket, Lock } from 'lucide-react';
import PKRIcon from '../../icons/PKRIcon';
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
        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <Package className="w-8 h-8 text-cyan-400" />
          What's Included?
        </h2>
        <p className="text-gray-300 mb-6">Select what comes with your device</p>

        <div className="grid md:grid-cols-3 gap-4">
          <ButtonCard
            icon={<Package className="w-6 h-6" />}
            label="Complete Box"
            selected={watch('accessories') === 'complete-box'}
            onClick={() => setValue('accessories', 'complete-box')}
          />
          <ButtonCard
            icon={<Link2 className="w-6 h-6" />}
            label="Cable Only"
            selected={watch('accessories') === 'cable-only'}
            onClick={() => setValue('accessories', 'cable-only')}
          />
          <ButtonCard
            icon={<Smartphone className="w-6 h-6" />}
            label="Device Only"
            selected={watch('accessories') === 'device-only'}
            onClick={() => setValue('accessories', 'device-only')}
          />
        </div>
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-yellow-400" />
          Note: Most manufacturers no longer include charging adapters with new phones
        </p>
      </div>

      {/* Location Section */}
      <div className="border-t-2 border-white/10 pt-8">
        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-cyan-400" />
          Location
        </h2>
        <p className="text-gray-300 mb-6">Where are you located?</p>

        <div className="space-y-4">
          {/* City */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              City *
            </label>
            
            {/* Hidden input for form registration */}
            <input type="hidden" {...register('city')} />
            
            {/* Search input (not part of form) */}
            <input
              type="text"
              placeholder="Search or select city..."
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
              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto border-2 border-white/20 rounded-lg bg-gray-800 shadow-lg">
                {Object.keys(filteredCitiesByProvince).length > 0 ? (
                  Object.entries(filteredCitiesByProvince).map(([province, cities]) => (
                    <div key={province}>
                      <div className="px-4 py-2 text-xs font-bold text-gray-300 bg-white/5 sticky top-0 border-b">
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
                          className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm text-gray-200 border-b border-white/10 last:border-0 transition-colors"
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
            
            {errors.city && errors.city.message && (
              <p className="text-red-300 text-sm mt-1">{errors.city.message as string}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Address / Area *
            </label>
            <input
              {...register('address')}
              className="input-field"
              placeholder="Street address or area (e.g., DHA Phase 5, Gulberg)"
            />
            {errors.address && errors.address.message && (
              <p className="text-red-300 text-sm mt-1">{errors.address.message as string}</p>
            )}
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              Your exact address will only be shared after you accept a buyer's request
            </p>
          </div>
        </div>
      </div>

      {/* Summary Info Box */}
      <div className="border-t-2 border-white/10 pt-8">
        <div className="p-6 bg-linear-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400 shrink-0" />
            <div>
              <h3 className="font-bold text-green-300 text-lg mb-2">
                Almost Ready to List!
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                You're one step away from getting your phone listed. Our AI will verify your listing and suggest the best price!
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Verification</span>
                <span>•</span>
                <span className="flex items-center gap-1"><PKRIcon className="w-3 h-3" /> Price Suggestion</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Rocket className="w-3 h-3" /> Instant Listing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
