import { motion } from 'framer-motion';
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ButtonCard } from '../../common/ButtonCard';

interface BasicInfoStepProps {
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
}

export default function BasicInfoStep({ register, errors, watch, setValue }: BasicInfoStepProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          <span className="mr-3">📝</span>
          Basic Information
        </h2>
        <p className="text-gray-600">Let's start with the essentials</p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Listing Title *
        </label>
        <input
          {...register('title')}
          className="input-field"
          placeholder="e.g., iPhone 14 Pro Max 256GB Silver - Excellent Condition"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title.message as string}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          💡 Make it catchy! Include brand, model, storage & condition
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          {...register('description')}
          rows={5}
          className="input-field resize-none"
          placeholder="Describe your phone's condition, accessories included, reason for selling, etc."
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description.message as string}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {(watch('description') as string)?.length || 0} characters (min 50)
        </p>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Price (PKR) *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-lg">
            Rs
          </span>
          <input
            type="number"
            {...register('price', { valueAsNumber: true })}
            className="input-field pl-12 text-lg font-semibold"
            placeholder="95000"
          />
        </div>
        {errors.price && (
          <p className="text-red-600 text-sm mt-1">{errors.price.message as string}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          💡 Our AI will suggest a fair price after inspection
        </p>
      </div>

      {/* Price Negotiable */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Price Flexibility
        </label>
        <div className="grid grid-cols-2 gap-4">
          <ButtonCard
            icon="💰"
            label="Fixed Price"
            selected={watch('priceNegotiable') === false}
            onClick={() => setValue('priceNegotiable', false)}
          />
          <ButtonCard
            icon="💬"
            label="Negotiable"
            selected={watch('priceNegotiable') === true}
            onClick={() => setValue('priceNegotiable', true)}
          />
        </div>
      </div>

      {/* PTA Status */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          PTA Approval Status *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <ButtonCard
            icon="✅"
            label="PTA Approved"
            selected={watch('ptaApproved') === true}
            onClick={() => setValue('ptaApproved', true)}
          />
          <ButtonCard
            icon="⚠️"
            label="Non-PTA"
            selected={watch('ptaApproved') === false}
            onClick={() => setValue('ptaApproved', false)}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 PTA approval significantly affects resale value in Pakistan market
        </p>
      </div>
    </motion.div>
  );
}
