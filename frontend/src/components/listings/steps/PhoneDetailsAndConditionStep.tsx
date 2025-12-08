import { motion } from 'framer-motion';
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ButtonCard } from '../../common/ButtonCard';

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Huawei', 'Google', 'Nokia', 'Infinix', 'Tecno', 'Other'];
const STORAGE_OPTIONS = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];

const CONDITION_INFO = {
  excellent: {
    label: 'Excellent',
    description: 'Like new, no visible scratches or dents. Screen is perfect. All functions work flawlessly. Battery health 90%+. Box and accessories included.',
    icon: '⭐'
  },
  good: {
    label: 'Good', 
    description: 'Minor signs of use. Possible light scratches on body or screen. All functions work properly. Battery health 80-90%. May not include original box.',
    icon: '✨'
  },
  fair: {
    label: 'Fair',
    description: 'Visible wear and tear. Noticeable scratches or small dents. All essential functions work. Battery health 60-80%. No accessories included.',
    icon: '📱'
  },
  poor: {
    label: 'Poor',
    description: 'Heavy signs of use. Cracked screen or significant damage. May have functional issues. Battery health below 60%. Sold as-is for parts/repair.',
    icon: '🔧'
  }
};

const DISPLAY_QUALITY = {
  flawless: { label: 'Flawless', description: 'No scratches, perfect display', icon: '✨' },
  'minor-scratches': { label: 'Minor Scratches', description: 'Light scratches, barely visible', icon: '👌' },
  'noticeable-wear': { label: 'Noticeable Wear', description: 'Visible scratches but functional', icon: '📱' },
  cracked: { label: 'Cracked', description: 'Cracked screen but usable', icon: '💔' },
};

const COMMON_ISSUES = [
  { value: 'battery-drains-fast', label: 'Battery Drains Fast', icon: '🔋' },
  { value: 'camera-issue', label: 'Camera Issue', icon: '📷' },
  { value: 'speaker-low', label: 'Speaker Low/Muffled', icon: '🔊' },
  { value: 'microphone-issue', label: 'Microphone Issue', icon: '🎤' },
  { value: 'wifi-bluetooth', label: 'WiFi/Bluetooth Issues', icon: '📡' },
  { value: 'charging-slow', label: 'Slow Charging', icon: '⚡' },
  { value: 'touch-not-responsive', label: 'Touch Not Responsive', icon: '👆' },
  { value: 'overheating', label: 'Overheating', icon: '🔥' },
];

interface PhoneDetailsAndConditionStepProps {
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  selectedCondition: string;
  setSelectedCondition: (condition: string) => void;
  selectedIssues: string[];
  setSelectedIssues: (issues: string[]) => void;
}

export default function PhoneDetailsAndConditionStep({
  register,
  errors,
  watch,
  setValue,
  selectedCondition,
  setSelectedCondition,
  selectedIssues,
  setSelectedIssues,
}: PhoneDetailsAndConditionStepProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-8"
    >
      {/* Phone Details Section */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          <span className="mr-3">📱</span>
          Phone Details
        </h2>
        <p className="text-gray-600 mb-6">Tell us about your device</p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Brand */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Brand *
            </label>
            <select {...register('brand')} className="input-field">
              <option value="">Select Brand</option>
              {BRANDS.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            {errors.brand && (
              <p className="text-red-600 text-sm mt-1">{errors.brand.message as string}</p>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Model *
            </label>
            <input
              {...register('model')}
              className="input-field"
              placeholder="iPhone 14 Pro Max"
            />
            {errors.model && (
              <p className="text-red-600 text-sm mt-1">{errors.model.message as string}</p>
            )}
          </div>

          {/* Storage */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Storage *
            </label>
            <select {...register('storage')} className="input-field">
              <option value="">Select Storage</option>
              {STORAGE_OPTIONS.map((storage) => (
                <option key={storage} value={storage}>{storage}</option>
              ))}
            </select>
            {errors.storage && (
              <p className="text-red-600 text-sm mt-1">{errors.storage.message as string}</p>
            )}
          </div>

          {/* RAM */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              RAM (Optional)
            </label>
            <input
              {...register('ram')}
              className="input-field"
              placeholder="8GB"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Color *
            </label>
            <input
              {...register('color')}
              className="input-field"
              placeholder="Silver, Space Gray, Gold..."
            />
            {errors.color && (
              <p className="text-red-600 text-sm mt-1">{errors.color.message as string}</p>
            )}
          </div>

          {/* IMEI */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              IMEI (Optional, min 15 digits)
            </label>
            <input
              {...register('imei')}
              className="input-field"
              placeholder="123456789012345"
              maxLength={15}
            />
          </div>

          {/* Warranty */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('warranty')}
                className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                🛡️ Under Official Warranty
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Condition Section */}
      <div className="border-t-2 border-gray-200 pt-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          <span className="mr-3">⭐</span>
          Condition Assessment
        </h2>
        <p className="text-gray-600 mb-6">Rate your phone's overall condition</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(CONDITION_INFO).map(([key, info]) => (
            <ButtonCard
              key={key}
              icon={info.icon}
              label={info.label}
              selected={watch('condition') === key}
              onClick={() => {
                setValue('condition', key as 'excellent' | 'good' | 'fair' | 'poor');
                setSelectedCondition(key);
              }}
            />
          ))}
        </div>
        {errors.condition && (
          <p className="text-red-600 text-sm mt-2">{errors.condition.message as string}</p>
        )}

        {selectedCondition && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
          >
            <p className="text-sm font-semibold text-blue-900 mb-1">
              {CONDITION_INFO[selectedCondition as keyof typeof CONDITION_INFO].icon}{' '}
              {CONDITION_INFO[selectedCondition as keyof typeof CONDITION_INFO].label}
            </p>
            <p className="text-sm text-blue-800">
              {CONDITION_INFO[selectedCondition as keyof typeof CONDITION_INFO].description}
            </p>
          </motion.div>
        )}
      </div>

      {/* Battery Health (Apple Only) */}
      {watch('brand') === 'Apple' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-t-2 border-gray-200 pt-8"
        >
          <h3 className="text-2xl font-black text-gray-900 mb-2">
            <span className="mr-3">🔋</span>
            Battery Health
          </h3>
          <p className="text-gray-600 mb-4">⚡ Check in Settings → Battery → Battery Health</p>

          <div className="max-w-md">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Battery Health % (0-100)
            </label>
            <input
              type="number"
              {...register('batteryHealth', { valueAsNumber: true })}
              className="input-field"
              placeholder="85"
              min="0"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Enter the percentage shown in your iPhone's Battery Health settings
            </p>
          </div>
        </motion.div>
      )}

      {/* Display Quality */}
      <div className="border-t-2 border-gray-200 pt-8">
        <h3 className="text-2xl font-black text-gray-900 mb-2">
          <span className="mr-3">📱</span>
          Display Condition
        </h3>
        <p className="text-gray-600 mb-4">👀 Rate your screen's physical condition</p>

        <div className="grid md:grid-cols-4 gap-3">
          {Object.entries(DISPLAY_QUALITY).map(([key, info]) => (
            <ButtonCard
              key={key}
              icon={info.icon}
              label={info.label}
              selected={watch('displayQuality') === key}
              onClick={() => setValue('displayQuality', key as keyof typeof DISPLAY_QUALITY)}
            />
          ))}
        </div>

        {(watch('displayQuality') as string) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-sm text-blue-800">
              {DISPLAY_QUALITY[watch('displayQuality') as keyof typeof DISPLAY_QUALITY]?.description}
            </p>
          </motion.div>
        )}
      </div>

      {/* Functionality */}
      <div className="border-t-2 border-gray-200 pt-8">
        <h3 className="text-2xl font-black text-gray-900 mb-2">
          <span className="mr-3">⚙️</span>
          Device Functionality
        </h3>
        <p className="text-gray-600 mb-4">✨ Are all features working perfectly?</p>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <ButtonCard
            icon="✅"
            label="Everything Works"
            selected={watch('allFeaturesWorking') === true}
            onClick={() => {
              setValue('allFeaturesWorking', true);
              setSelectedIssues([]);
              setValue('issues', []);
            }}
          />
          <ButtonCard
            icon="⚠️"
            label="Has Some Issues"
            selected={watch('allFeaturesWorking') === false}
            onClick={() => setValue('allFeaturesWorking', false)}
          />
        </div>

        {watch('allFeaturesWorking') === false && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <p className="text-sm text-gray-600 font-medium">Select all issues that apply:</p>
            <div className="grid md:grid-cols-2 gap-2">
              {COMMON_ISSUES.map((issue) => {
                const isSelected = selectedIssues.includes(issue.value);
                return (
                  <motion.button
                    key={issue.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const newIssues = isSelected
                        ? selectedIssues.filter(i => i !== issue.value)
                        : [...selectedIssues, issue.value];
                      setSelectedIssues(newIssues);
                      setValue('issues', newIssues);
                    }}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <span className="text-lg">{issue.icon}</span>
                    <span className={`text-sm ${isSelected ? 'text-orange-700 font-medium' : 'text-gray-700'}`}>
                      {issue.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Additional Notes */}
      <div className="border-t-2 border-gray-200 pt-8">
        <h3 className="text-2xl font-black text-gray-900 mb-2">
          <span className="mr-3">📝</span>
          Additional Details (Optional)
        </h3>
        <p className="text-gray-600 mb-4">💬 Anything else buyers should know?</p>

        <textarea
          {...register('additionalNotes')}
          className="input-field min-h-[100px] resize-none"
          placeholder="Example: Minor dent on back corner, phone was always kept in a case, recently serviced, etc."
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {(watch('additionalNotes') as string)?.length || 0}/500 characters
        </p>
      </div>
    </motion.div>
  );
}
