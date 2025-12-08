import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { listingService } from '../../services/listing.service';
import { inspectionService } from '../../services/inspection.service';

// Step Components
import StepIndicator from '../../components/listings/steps/StepIndicator';
import ImagesStep from '../../components/listings/steps/ImagesStep';
import BasicInfoStep from '../../components/listings/steps/BasicInfoStep';
import PhoneDetailsAndConditionStep from '../../components/listings/steps/PhoneDetailsAndConditionStep';
import AccessoriesAndLocationStep from '../../components/listings/steps/AccessoriesAndLocationStep';

const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  price: z.number().min(1000, 'Price must be at least 1000'),
  priceNegotiable: z.boolean().optional(),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  storage: z.string().min(1, 'Storage is required'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  ram: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  imei: z.string().optional(),
  warranty: z.boolean().optional(),
  ptaApproved: z.boolean().optional(),
  // Battery Health (Apple only)
  batteryHealth: z.number().min(0).max(100).optional(),
  // Phonely's Unique Condition Assessment
  displayQuality: z.enum(['flawless', 'minor-scratches', 'noticeable-wear', 'cracked']).optional(),
  allFeaturesWorking: z.boolean().optional(),
  issues: z.array(z.string()).optional(),
  additionalNotes: z.string().max(500).optional(),
  // Accessories (new simplified options)
  accessories: z.enum(['complete-box', 'cable-only', 'device-only']).optional(),
  // Location
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(1, 'City is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

// Multi-step form steps
const STEPS = [
  { id: 1, title: 'Photos', emoji: '📸', description: 'Upload images' },
  { id: 2, title: 'Basic Info', emoji: '📝', description: 'Title & price' },
  { id: 3, title: 'Details', emoji: '📱', description: 'Phone & condition' },
  { id: 4, title: 'Finish', emoji: '📍', description: 'Accessories & location' },
];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<Array<{ url: string; type: string }>>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

  const imageTypes = [
    { type: 'front', label: '📱 Front View', description: 'Full front view with screen off' },
    { type: 'back', label: '🔄 Back View', description: 'Full back view showing camera & logo' },
    { type: 'left-side', label: '◀️ Left Side', description: 'Left side showing buttons & ports' },
    { type: 'right-side', label: '▶️ Right Side', description: 'Right side showing buttons & ports' },
    { type: 'top', label: '⬆️ Top View', description: 'Top edge of the phone' },
    { type: 'bottom', label: '⬇️ Bottom View', description: 'Bottom edge showing charging port' },
    { type: 'front-camera-on', label: '🤳 Selfie Camera', description: 'Open camera app (selfie mode)' },
    { type: 'back-camera-on', label: '📷 Back Camera', description: 'Open camera app (rear camera)' },
    { type: 'display-test', label: '🖥️ Display Test', description: 'White screen at full brightness' },
  ];

  const getNextRequiredImageType = () => {
    for (const imageType of imageTypes) {
      if (!images.some(img => img.type === imageType.type)) {
        return imageType;
      }
    }
    return null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      priceNegotiable: false,
      warranty: false,
      ptaApproved: true,
      allFeaturesWorking: true,
      accessories: 'device-only',
      batteryHealth: 80,
      issues: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: listingService.createListing,
    onSuccess: async (listing) => {
      // Start AI inspection in background (fire and forget)
      try {
        // Use the actual listing images with their types
        const listingImages = listing.images.map((img, index) => {
          const imgUrl = typeof img === 'string' ? img : img.url;
          const imgType = typeof img === 'object' && img.type ? img.type : images[index]?.type || 'front';
          return {
            url: imgUrl,
            type: imgType,
            order: index,
          };
        });
        
        // Start inspection but don't wait for it
        await inspectionService.startInspection(
          listing._id,
          listingImages,
          {
            brand: listing.phone.brand,
            model: listing.phone.model,
            storage: listing.phone.storage,
            ram: listing.phone.ram || '4GB',
            color: listing.phone.color || 'Black',
            condition: listing.condition,
            hasBox: listing.accessories?.box || false,
            hasWarranty: listing.phone.warranty?.hasWarranty || false,
            launchDate: '2023-01', // Default launch date - backend will handle this
            retailPrice: 50000, // Default retail price - backend will fetch from WhatMobile
            ptaApproved: true, // Default PTA status for Pakistan market
          },
          listing.description
        );
        
        console.log('✅ AI inspection started in background');
      } catch (err) {
        console.error('Failed to start inspection:', err);
        // Continue anyway - inspection can fail but listing is created
      }

      // Navigate to homepage with success message
      navigate('/', { 
        state: { 
          message: 'listing_submitted',
          listingTitle: listing.title
        } 
      });
    },
    onError: () => {
      setError('Failed to create listing. Please try again.');
    },
  });

  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    setError('');
    try {
      const url = await listingService.uploadImage(file);
      
      // Determine the type for this image
      const nextType = getNextRequiredImageType();
      const imageType = nextType ? nextType.type : 'other';
      
      setImages((prev) => [...prev, { url, type: imageType }]);
      return url;
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image. Please try again.');
      throw err;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Navigation handlers for multi-step form
  const handleNext = async () => {
    // Field validation for each step
    const fieldsMap: Record<number, Array<keyof ListingFormData>> = {
      1: [], // Images validated separately
      2: ['title', 'description', 'price', 'priceNegotiable', 'ptaApproved'],
      3: ['brand', 'model', 'storage', 'color', 'condition'],
      4: ['city', 'address', 'accessories'],
    };
    
    const fields = fieldsMap[currentStep];
    if (fields && fields.length > 0) {
      const isValid = await trigger(fields);
      if (!isValid) {
        setError('Please fill in all required fields correctly');
        return;
      }
    }
    
    // Step 1: Validate images
    if (currentStep === 1 && images.length === 0) {
      setError('Please upload at least one image');
      return;
    }
    
    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: ListingFormData) => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setError('');

    // Map accessories enum to object format expected by backend
    const accessoriesMap: Record<string, { box: boolean; charger: boolean; cable: boolean; earphones: boolean; case: boolean; screenProtector: boolean }> = {
      'complete-box': { box: true, charger: false, cable: true, earphones: false, case: false, screenProtector: false },
      'cable-only': { box: false, charger: false, cable: true, earphones: false, case: false, screenProtector: false },
      'device-only': { box: false, charger: false, cable: false, earphones: false, case: false, screenProtector: false },
    };

    const listingData = {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      priceNegotiable: data.priceNegotiable,
      condition: data.condition,
      ptaApproved: data.ptaApproved,
      conditionDetails: {
        batteryHealth: data.batteryHealth || undefined,
        displayQuality: data.displayQuality || undefined,
        allFeaturesWorking: data.allFeaturesWorking !== undefined ? data.allFeaturesWorking : true,
        functionalIssues: data.issues && data.issues.length > 0 ? data.issues : [],
        additionalNotes: data.additionalNotes || undefined,
      },
      phone: {
        brand: data.brand,
        model: data.model,
        storage: data.storage,
        ram: data.ram,
        color: data.color,
        imei: data.imei && data.imei.length >= 15 ? data.imei : undefined,
        warranty: data.warranty ? {
          hasWarranty: true,
          type: 'official',
        } : undefined,
      },
      accessories: accessoriesMap[data.accessories || 'device-only'],
      location: {
        city: data.city,
        area: data.address,
        // Don't send coordinates to avoid GeoJSON validation issues
      },
      images: images.map((img, index) => ({
        url: img.url,
        type: img.type,
        order: index,
      })),
    };

    createMutation.mutate(listingData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative"
    >
      {/* Animated Background Blobs - Optimized with CSS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div 
          className="absolute top-20 -left-20 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
        />
        <div 
          className="absolute top-40 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
        />
        <div 
          className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
        />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="mr-2">💰</span>
          <span className="bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Sell Your Phone
          </span>
        </h1>
        <p className="text-gray-600 text-lg">
          Fill in the deets and our AI will verify your phone's condition ✨
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Get the best price, no cap! 🔥
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-linear-to-r from-red-50 to-pink-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 shadow-sm"
        >
          <span className="font-semibold">⚠️ Oops!</span> {error}
        </motion.div>
      )}

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <ImagesStep
                images={images}
                isUploadingImage={isUploadingImage}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
                imageTypes={imageTypes}
              />
            )}

            {currentStep === 2 && (
              <BasicInfoStep
                register={register as never}
                errors={errors as never}
                watch={watch as never}
                setValue={setValue as never}
              />
            )}

            {currentStep === 3 && (
              <PhoneDetailsAndConditionStep
                register={register as never}
                errors={errors as never}
                watch={watch as never}
                setValue={setValue as never}
                selectedCondition={selectedCondition}
                setSelectedCondition={setSelectedCondition}
                selectedIssues={selectedIssues}
                setSelectedIssues={setSelectedIssues}
              />
            )}

            {currentStep === 4 && (
              <AccessoriesAndLocationStep
                register={register as never}
                errors={errors as never}
                watch={watch as never}
                setValue={setValue as never}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between gap-4 pt-6"
        >
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 shadow-md hover:shadow-lg'
            }`}
          >
            ← Back
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 bg-linear-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-8 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                '🚀 Create Listing'
              )}
            </button>
          )}
        </motion.div>
      </form>

      {/* Submitting Loading Modal */}
      {createMutation.isPending && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <div className="w-full h-full rounded-full bg-linear-to-r from-primary-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl">
                  📤
                </div>
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2">
                <span className="bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Submitting Your Listing
                </span>
              </h3>
              
              <p className="text-gray-600">
                Preparing your ad for AI inspection...
              </p>
              
              <p className="text-xs text-gray-500 mt-4">
                Almost there! ⏱️
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

