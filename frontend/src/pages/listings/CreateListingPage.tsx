import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Sparkles, AlertTriangle, Rocket, CheckCircle2, Upload, Clock, Bot, Search, Users, RotateCcw, Camera, Monitor, User } from 'lucide-react';
import PKRIcon from '../../components/icons/PKRIcon';
import PhoneIcon from '../../components/icons/PhoneIcon';
import ArrowLeftIcon from '../../components/icons/ArrowLeftIcon';
import ArrowRightIcon from '../../components/icons/ArrowRightIcon';
import ArrowUpIcon from '../../components/icons/ArrowUpIcon';
import ArrowDownIcon from '../../components/icons/ArrowDownIcon';
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
  { id: 1, title: 'Photos', icon: 'Camera', description: 'Upload images' },
  { id: 2, title: 'Basic Info', icon: 'FileText', description: 'Title & price' },
  { id: 3, title: 'Details', icon: 'Smartphone', description: 'Phone & condition' },
  { id: 4, title: 'Finish', icon: 'MapPin', description: 'Accessories & location' },
];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<Array<{ url: string; type: string }>>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

  // Fetch existing listing if in edit mode
  const { data: existingListing, isLoading: isLoadingListing } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingService.getListingById(id!),
    enabled: isEditMode,
  });

  const imageTypes = [
    { type: 'front', label: 'Front View', description: 'Full front view with screen off', icon: <PhoneIcon className="w-5 h-5" /> },
    { type: 'back', label: 'Back View', description: 'Full back view showing camera & logo', icon: <RotateCcw className="w-5 h-5" /> },
    { type: 'left-side', label: 'Left Side', description: 'Left side showing buttons & ports', icon: <ArrowLeftIcon className="w-5 h-5" /> },
    { type: 'right-side', label: 'Right Side', description: 'Right side showing buttons & ports', icon: <ArrowRightIcon className="w-5 h-5" /> },
    { type: 'top', label: 'Top View', description: 'Top edge of the phone', icon: <ArrowUpIcon className="w-5 h-5" /> },
    { type: 'bottom', label: 'Bottom View', description: 'Bottom edge showing charging port', icon: <ArrowDownIcon className="w-5 h-5" /> },
    { type: 'front-camera-on', label: 'Selfie Camera', description: 'Open camera app (selfie mode)', icon: <User className="w-5 h-5" /> },
    { type: 'back-camera-on', label: 'Back Camera', description: 'Open camera app (rear camera)', icon: <Camera className="w-5 h-5" /> },
    { type: 'display-test', label: 'Display Test', description: 'White screen at full brightness', icon: <Monitor className="w-5 h-5" /> },
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
    reset,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    mode: 'onBlur', // Only validate on blur, not on change
    defaultValues: {
      priceNegotiable: false,
      warranty: false,
      ptaApproved: true,
      allFeaturesWorking: true,
      accessories: 'device-only',
      issues: [],
    },
  });

  // Load existing listing data when in edit mode
  useEffect(() => {
    if (isEditMode && existingListing) {
      // Set form values
      reset({
        title: existingListing.title,
        description: existingListing.description,
        price: existingListing.price,
        priceNegotiable: existingListing.priceNegotiable,
        brand: existingListing.phone.brand,
        model: existingListing.phone.model,
        storage: existingListing.phone.storage,
        condition: existingListing.condition,
        ram: existingListing.phone.ram,
        color: existingListing.phone.color,
        imei: existingListing.phone.imei,
        warranty: existingListing.phone.warranty?.hasWarranty,
        ptaApproved: existingListing.ptaApproved,
        batteryHealth: existingListing.conditionDetails?.batteryHealth,
        displayQuality: existingListing.conditionDetails?.displayQuality as 'flawless' | 'minor-scratches' | 'noticeable-wear' | 'cracked' | undefined,
        allFeaturesWorking: existingListing.conditionDetails?.allFeaturesWorking,
        issues: existingListing.conditionDetails?.functionalIssues || [],
        additionalNotes: existingListing.conditionDetails?.additionalNotes,
        accessories: existingListing.accessories?.box 
          ? 'complete-box' 
          : existingListing.accessories?.cable 
          ? 'cable-only' 
          : 'device-only',
        address: existingListing.location.address || existingListing.location.area || '',
        city: existingListing.location.city,
        latitude: existingListing.location.coordinates?.coordinates?.[1],
        longitude: existingListing.location.coordinates?.coordinates?.[0],
      });

      // Set images
      const loadedImages = existingListing.images.map((img: string | { url: string; type?: string }) => ({
        url: typeof img === 'string' ? img : img.url,
        type: typeof img === 'object' && img.type ? img.type : 'front',
      }));
      setImages(loadedImages);

      // Set condition and issues
      setSelectedCondition(existingListing.condition);
      setSelectedIssues(existingListing.conditionDetails?.functionalIssues || []);
    }
  }, [isEditMode, existingListing, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof listingService.updateListing>[1]) => listingService.updateListing(id!, data),
    onSuccess: (listing) => {
      navigate(`/listings/${id}`, { 
        state: { 
          message: 'listing_updated',
          listingTitle: listing.title
        } 
      });
    },
    onError: () => {
      setError('Failed to update listing. Please try again.');
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
            launchDate: '2023-01', // AI service will fetch actual launch date from WhatMobile/GSMArena
            retailPrice: 0, // AI service will fetch actual retail price from WhatMobile/PriceOye
            ptaApproved: true, // Default PTA status for Pakistan market
          },
          listing.description
        );
        
        console.log('AI inspection started in background');
      } catch (err) {
        console.error('Failed to start inspection:', err);
        // Continue anyway - inspection can fail but listing is created
      }

      // Show confirmation screen with listing details
      setCurrentStep(5); // Move to confirmation step
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        // Only include batteryHealth for Apple devices
        ...(data.brand === 'Apple' && data.batteryHealth ? { batteryHealth: data.batteryHealth } : {}),
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

    if (isEditMode) {
      updateMutation.mutate(listingData);
    } else {
      createMutation.mutate(listingData);
    }
  };

  // Show loading state when fetching existing listing
  if (isEditMode && isLoadingListing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative"
    >
      {/* Circuit Pattern Background */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="createCircuit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'#2563eb',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
          </linearGradient>
          <pattern id="createPattern" x="0" y="0" width="400" height="300" patternUnits="userSpaceOnUse">
            <path d="M50 0 L50 90 L70 110 L70 200" stroke="url(#createCircuit)" strokeWidth="2" fill="none"/>
            <path d="M100 0 L100 70 L120 90 L120 180" stroke="url(#createCircuit)" strokeWidth="2" fill="none"/>
            <path d="M150 0 L150 100 L170 120 L170 220" stroke="url(#createCircuit)" strokeWidth="2" fill="none"/>
            <circle cx="50" cy="90" r="4" fill="#06b6d4"/>
            <circle cx="100" cy="70" r="4" fill="#7c3aed"/>
            <rect x="116" y="86" width="8" height="8" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#createPattern)"/>
      </svg>

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
        <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center gap-3">
          {isEditMode ? <Edit className="w-10 h-10 text-cyan-400" /> : <PKRIcon className="w-10 h-10 text-cyan-400" />}
          <span className="bg-linear-to-r from-cyan-400 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {isEditMode ? 'Edit Your Listing' : 'Sell Your Phone'}
          </span>
        </h1>
        <p className="text-gray-300 text-lg flex items-center justify-center gap-2">
          {isEditMode ? 'Update your listing details' : (
            <>
              Fill in the deets and our AI will verify your phone's condition
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </>
          )}
        </p>
        {!isEditMode && (
          <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
            Get the best price, no cap!
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </p>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6 shadow-sm backdrop-blur-sm"
        >
          <span className="font-semibold flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Oops!</span> {error}
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

            {/* Step 5: Success Confirmation Screen */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-8"
              >
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-32 h-32 mx-auto mb-6 bg-linear-to-br from-green-400 via-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl"
                >
                  <CheckCircle2 className="w-16 h-16 text-white" />
                </motion.div>

                {/* Success Message */}
                <div>
                  <h2 className="text-4xl font-black mb-3">
                    <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Listing Submitted Successfully!
                    </span>
                  </h2>
                  <p className="text-xl text-gray-300 mb-2 flex items-center justify-center gap-2">
                    Your phone is now live on Phonely
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </p>
                  <p className="text-sm text-gray-500">
                    Listing ID: <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-gray-300">{createMutation.data?._id || 'Processing...'}</span>
                  </p>
                </div>

                {/* What's Next Section */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2 text-white">
                    <Bot className="w-6 h-6 text-cyan-400" />
                    <span>What Happens Next?</span>
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-6 text-left">
                    <div className="space-y-2">
                      <Search className="w-10 h-10 mb-2 text-cyan-400" />
                      <h4 className="font-bold text-lg text-white">AI Inspection</h4>
                      <p className="text-sm text-gray-300">
                        Our AI is analyzing your photos and verifying the condition (takes 30-60 seconds)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <PKRIcon className="w-10 h-10 mb-2 text-green-400" />
                      <h4 className="font-bold text-lg text-white">Price Verification</h4>
                      <p className="text-sm text-gray-300">
                        AI checks current market prices and suggests optimal pricing
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Users className="w-10 h-10 mb-2 text-purple-400" />
                      <h4 className="font-bold text-lg text-white">Go Live</h4>
                      <p className="text-sm text-gray-300">
                        Your listing appears to buyers immediately with AI trust score
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-lg p-6 max-w-xl mx-auto">
                  <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2 text-white">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>Pro Tips</span>
                  </h3>
                  <ul className="text-left space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                      <span>Check your email - buyers may contact you directly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                      <span>Respond quickly to inquiries for better visibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                      <span>AI trust score updates within 1 minute - refresh your listing page</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                      <span>You can edit your listing anytime from "My Listings"</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <motion.button
                    onClick={() => navigate('/listings')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary px-8 py-4 text-lg"
                  >
                    <Search className="w-5 h-5 inline mr-2" />
                    Browse All Listings
                  </motion.button>
                  
                  <motion.button
                    onClick={() => navigate('/')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary px-8 py-4 text-lg"
                  >
                    🏠 Go to Homepage
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons - Hide on confirmation screen */}
        {currentStep < 5 && (
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
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-white/5 backdrop-blur-md text-gray-200 hover:bg-white/10 border-2 border-white/10 shadow-md hover:shadow-lg'
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
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-8 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  isEditMode ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Update Listing
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      Create Listing
                    </>
                  )
                )}
              </button>
            )}
          </motion.div>
        )}
      </form>

      {/* Submitting Loading Modal */}
      {(createMutation.isPending || updateMutation.isPending) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <div className="w-full h-full rounded-full bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2">
                <span className="bg-linear-to-r from-cyan-400 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Submitting Your Listing
                </span>
              </h3>
              
              <p className="text-gray-300">
                Preparing your ad for AI inspection...
              </p>
              
              <p className="text-xs text-gray-500 mt-4">
                Almost there! <Clock className="w-4 h-4 inline ml-1" />
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

