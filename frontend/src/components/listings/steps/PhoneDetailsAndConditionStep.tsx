import { motion } from 'framer-motion';
import { Smartphone, Sparkles, Battery, Zap, Eye, FileText, MessageSquare, Shield, Star, Wrench, Camera, Volume2, Mic, Wifi, Plug, Hand, Thermometer, CheckCircle2, AlertTriangle, Lightbulb, Settings } from 'lucide-react';
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ButtonCard } from '../../common/ButtonCard';

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Huawei', 'Google', 'Nokia', 'Infinix', 'Tecno', 'Other'];
const STORAGE_OPTIONS = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];

const CONDITION_INFO = {
  excellent: {
    label: 'Excellent',
    description: 'Like new, no visible scratches or dents. Screen is perfect. All functions work flawlessly. Battery health 90%+. Box and accessories included.',
    icon: <Star className="w-6 h-6" />
  },
  good: {
    label: 'Good', 
    description: 'Minor signs of use. Possible light scratches on body or screen. All functions work properly. Battery health 80-90%. May not include original box.',
    icon: <Sparkles className="w-6 h-6" />
  },
  fair: {
    label: 'Fair',
    description: 'Visible wear and tear. Noticeable scratches or small dents. All essential functions work. Battery health 60-80%. No accessories included.',
    icon: <Smartphone className="w-6 h-6" />
  },
  poor: {
    label: 'Poor',
    description: 'Heavy signs of use. Cracked screen or significant damage. May have functional issues. Battery health below 60%. Sold as-is for parts/repair.',
    icon: <Wrench className="w-6 h-6" />
  }
};

const DISPLAY_QUALITY = {
  flawless: { label: 'Flawless', description: 'No scratches, perfect display', icon: <Sparkles className="w-6 h-6" /> },
  'minor-scratches': { label: 'Minor Scratches', description: 'Light scratches, barely visible', icon: <CheckCircle2 className="w-6 h-6" /> },
  'noticeable-wear': { label: 'Noticeable Wear', description: 'Visible scratches but functional', icon: <Smartphone className="w-6 h-6" /> },
  cracked: { label: 'Cracked', description: 'Cracked screen but usable', icon: <AlertTriangle className="w-6 h-6" /> },
};

const COMMON_ISSUES = [
  { value: 'battery-drains-fast', label: 'Battery Drains Fast', icon: <Battery className="w-5 h-5" /> },
  { value: 'camera-issue', label: 'Camera Issue', icon: <Camera className="w-5 h-5" /> },
  { value: 'speaker-low', label: 'Speaker Low/Muffled', icon: <Volume2 className="w-5 h-5" /> },
  { value: 'microphone-issue', label: 'Microphone Issue', icon: <Mic className="w-5 h-5" /> },
  { value: 'wifi-bluetooth', label: 'WiFi/Bluetooth Issues', icon: <Wifi className="w-5 h-5" /> },
  { value: 'charging-slow', label: 'Slow Charging', icon: <Plug className="w-5 h-5" /> },
  { value: 'touch-not-responsive', label: 'Touch Not Responsive', icon: <Hand className="w-5 h-5" /> },
  { value: 'overheating', label: 'Overheating', icon: <Thermometer className="w-5 h-5" /> },
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
        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-cyan-400" />
          Phone Details
        </h2>
        <p className="text-gray-300 mb-6">Tell us about your device</p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Brand */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Brand *
            </label>
            <select {...register('brand')} className="input-field">
              <option value="">Select Brand</option>
              {BRANDS.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            {errors.brand && (
              <p className="text-red-300 text-sm mt-1">{errors.brand.message as string}</p>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Model *
            </label>
            <input
              {...register('model')}
              className="input-field"
              placeholder="iPhone 14 Pro Max"
            />
            {errors.model && (
              <p className="text-red-300 text-sm mt-1">{errors.model.message as string}</p>
            )}
          </div>

          {/* Storage */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Storage *
            </label>
            <select {...register('storage')} className="input-field">
              <option value="">Select Storage</option>
              {STORAGE_OPTIONS.map((storage) => (
                <option key={storage} value={storage}>{storage}</option>
              ))}
            </select>
            {errors.storage && (
              <p className="text-red-300 text-sm mt-1">{errors.storage.message as string}</p>
            )}
          </div>

          {/* RAM */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              RAM (Optional)
            </label>
            <select {...register('ram')} className="input-field">
              <option value="">Select RAM (Optional)</option>
              <option value="2GB">2GB</option>
              <option value="3GB">3GB</option>
              <option value="4GB">4GB</option>
              <option value="6GB">6GB</option>
              <option value="8GB">8GB</option>
              <option value="12GB">12GB</option>
              <option value="16GB">16GB</option>
              <option value="18GB">18GB</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Color *
            </label>
            <input
              {...register('color')}
              className="input-field"
              placeholder="Silver, Space Gray, Gold..."
            />
            {errors.color && (
              <p className="text-red-300 text-sm mt-1">{errors.color.message as string}</p>
            )}
          </div>

          {/* IMEI */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
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
                className="h-5 w-5 text-cyan-400 rounded focus:ring-cyan-500"
              />
              <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Under Official Warranty
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Condition Section */}
      <div className="border-t-2 border-white/10 pt-8">
        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <Star className="w-8 h-8 text-cyan-400" />
          Condition Assessment
        </h2>
        <p className="text-gray-300 mb-6">Rate your phone's overall condition</p>

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
          <p className="text-red-300 text-sm mt-2">{errors.condition.message as string}</p>
        )}

        {selectedCondition && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-blue-500/20 border-2 border-blue-500/50 rounded-xl backdrop-blur-sm"
          >
            <p className="text-sm font-semibold text-blue-300 mb-1 flex items-center gap-2">
              {CONDITION_INFO[selectedCondition as keyof typeof CONDITION_INFO].icon}
              {CONDITION_INFO[selectedCondition as keyof typeof CONDITION_INFO].label}
            </p>
            <p className="text-sm text-gray-300">
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
          className="border-t-2 border-white/10 pt-8"
        >
          <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
            <Battery className="w-6 h-6 text-cyan-400" />
            Battery Health
          </h3>
          <p className="text-gray-300 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Check in Settings → Battery → Battery Health
          </p>

          <div className="max-w-md">
            <label className="block text-sm font-bold text-gray-300 mb-2">
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
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-yellow-400" />
              Enter the percentage shown in your iPhone's Battery Health settings
            </p>
          </div>
        </motion.div>
      )}

      {/* Display Quality */}
      <div className="border-t-2 border-white/10 pt-8">
        <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
          <Smartphone className="w-6 h-6 text-cyan-400" />
          Display Condition
        </h3>
        <p className="text-gray-300 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          Rate your screen's physical condition
        </p>

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
            className="mt-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg backdrop-blur-sm"
          >
            <p className="text-sm text-gray-300">
              {DISPLAY_QUALITY[watch('displayQuality') as keyof typeof DISPLAY_QUALITY]?.description}
            </p>
          </motion.div>
        )}
      </div>

      {/* Functionality */}
      <div className="border-t-2 border-white/10 pt-8">
        <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
          <Settings className="w-6 h-6 text-cyan-400" />
          Device Functionality
        </h3>
        <p className="text-gray-300 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          Are all features working perfectly?
        </p>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <ButtonCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Everything Works"
            selected={watch('allFeaturesWorking') === true}
            onClick={() => {
              setValue('allFeaturesWorking', true);
              setSelectedIssues([]);
              setValue('issues', []);
            }}
          />
          <ButtonCard
            icon={<AlertTriangle className="w-6 h-6" />}
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
            <p className="text-sm text-gray-300 font-medium">Select all issues that apply:</p>
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
                        ? 'border-orange-500/50 bg-orange-500/20' 
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                      }
                    `}
                  >
                    <span className="shrink-0">{issue.icon}</span>
                    <span className={`text-sm ${isSelected ? 'text-orange-300 font-medium' : 'text-gray-300'}`}>
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
      <div className="border-t-2 border-white/10 pt-8">
        <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
          <FileText className="w-6 h-6 text-cyan-400" />
          Additional Details (Optional)
        </h3>
        <p className="text-gray-300 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          Anything else buyers should know?
        </p>

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
