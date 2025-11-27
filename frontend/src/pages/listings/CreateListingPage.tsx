import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { listingService } from '../../services/listing.service';
import { inspectionService } from '../../services/inspection.service';
import ImageUpload from '../../components/common/ImageUpload';
import Loading from '../../components/common/Loading';

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

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Huawei', 'Google', 'Nokia', 'Infinix', 'Tecno', 'Other'];
const STORAGE_OPTIONS = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];

// Detailed condition descriptions
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

const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  price: z.number().min(1000, 'Price must be at least 1000'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  storage: z.string().min(1, 'Storage is required'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  ram: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  imei: z.string().optional(),
  warranty: z.boolean().optional(),
  // Battery Health (Apple only)
  batteryHealth: z.number().min(0).max(100).optional(),
  // Functionality Issues (multi-select)
  faultyDisplay: z.boolean().optional(),
  faultyEarpiece: z.boolean().optional(),
  faultyFaceID: z.boolean().optional(),
  faultyProximitySensor: z.boolean().optional(),
  faultyVibrationMotor: z.boolean().optional(),
  faultyPowerButton: z.boolean().optional(),
  faultyVolumeButton: z.boolean().optional(),
  faultyMuteSwitch: z.boolean().optional(),
  faultyFrontCamera: z.boolean().optional(),
  faultyBackCamera: z.boolean().optional(),
  faultyFlash: z.boolean().optional(),
  faultySpeaker: z.boolean().optional(),
  faultyChargingPort: z.boolean().optional(),
  // Physical Damage (multi-select)
  damagedDisplay: z.boolean().optional(),
  damagedBack: z.boolean().optional(),
  damagedFrame: z.boolean().optional(),
  damagedCamera: z.boolean().optional(),
  // Repair History (multi-select)
  repairedTouchScreen: z.boolean().optional(),
  repairedDisplay: z.boolean().optional(),
  repairedFrontCamera: z.boolean().optional(),
  repairedBackCamera: z.boolean().optional(),
  repairedLoudspeaker: z.boolean().optional(),
  repairedEarpiece: z.boolean().optional(),
  repairedMicrophone: z.boolean().optional(),
  repairedBattery: z.boolean().optional(),
  otherRepairs: z.string().optional(),
  // Cosmetic Condition
  cosmeticFront: z.enum(['excellent', 'good', 'fair']),
  cosmeticBack: z.enum(['excellent', 'good', 'fair']),
  cosmeticFrame: z.enum(['excellent', 'good', 'fair']),
  // Accessories
  hasBox: z.boolean().optional(),
  hasCharger: z.boolean().optional(),
  hasCable: z.boolean().optional(),
  hasEarphones: z.boolean().optional(),
  // Location
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(1, 'City is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [images, setImages] = useState<Array<{ url: string; type: string }>>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [inspectionProgress, setInspectionProgress] = useState(0);
  const [selectedCondition, setSelectedCondition] = useState<keyof typeof CONDITION_INFO | ''>('');

  const imageTypes = [
    { type: 'front', label: '📱 Front View', description: 'Full front view with screen off' },
    { type: 'back', label: '🔄 Back View', description: 'Full back view showing camera & logo' },
    { type: 'left-side', label: '◀️ Left Side', description: 'Left side showing buttons & ports' },
    { type: 'right-side', label: '▶️ Right Side', description: 'Right side showing buttons & ports' },
    { type: 'top', label: '⬆️ Top View', description: 'Top edge of the phone' },
    { type: 'bottom', label: '⬇️ Bottom View', description: 'Bottom edge showing charging port' },
    { type: 'front-camera-on', label: '🤳 Selfie Camera', description: 'Open camera app (selfie mode)' },
    { type: 'back-camera-on', label: '� Back Camera', description: 'Open camera app (rear camera)' },
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
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      warranty: false,
      hasBox: false,
      hasCharger: false,
      hasCable: false,
      hasEarphones: false,
      batteryHealth: 80,
    },
  });

  const createMutation = useMutation({
    mutationFn: listingService.createListing,
    onSuccess: async (listing) => {
      setIsCreatingListing(true);
      
      // Start AI inspection with listing data
      try {
        setInspectionProgress(10);
        
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
        
        setInspectionProgress(20);
        
        const { inspectionId } = await inspectionService.startInspection(
          listing._id,
          listingImages,
          {
            brand: listing.phone.brand,
            model: listing.phone.model,
            storage: listing.phone.storage,
            condition: listing.condition,
          },
          listing.description
        );
        
        setInspectionProgress(30);
        
        // Poll inspection status until complete (AI takes 90-120 seconds)
        const maxAttempts = 60; // 60 attempts × 2 seconds = 2 minutes max
        let attempts = 0;
        let inspectionStatus = 'pending';
        
        const pollInterval = setInterval(() => {
          setInspectionProgress(prev => {
            // Progress from 30% to 90% gradually
            if (prev >= 90) return 90;
            return Math.min(prev + 2, 90);
          });
        }, 2000);
        
        while (attempts < maxAttempts && inspectionStatus !== 'completed' && inspectionStatus !== 'failed') {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls
          
          try {
            const statusData = await inspectionService.getInspectionStatus(inspectionId);
            inspectionStatus = statusData.status;
            
            console.log(`Inspection ${inspectionId} status: ${inspectionStatus} (attempt ${attempts + 1}/${maxAttempts})`);
            
            if (inspectionStatus === 'completed') {
              clearInterval(pollInterval);
              setInspectionProgress(100);
              
              // Small delay to show 100%
              await new Promise(resolve => setTimeout(resolve, 800));
              
              navigate(`/listings/${listing._id}`);
              return;
            } else if (inspectionStatus === 'failed') {
              clearInterval(pollInterval);
              console.error('Inspection failed');
              setIsCreatingListing(false);
              navigate(`/listings/${listing._id}`);
              return;
            }
          } catch (pollError) {
            console.error('Error polling inspection status:', pollError);
          }
          
          attempts++;
        }
        
        // Timeout - still navigate but log warning
        clearInterval(pollInterval);
        console.warn('Inspection polling timed out after 2 minutes');
        setInspectionProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/listings/${listing._id}`);
        
      } catch (err) {
        console.error('Failed to start inspection:', err);
        setIsCreatingListing(false);
        // Still navigate even if inspection fails
        navigate(`/listings/${listing._id}`);
      }
    },
    onError: () => {
      setError('Failed to create listing. Please try again.');
      setIsCreatingListing(false);
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

  const onSubmit = async (data: ListingFormData) => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setError('');

    // Collect functionality issues
    const functionalIssues = [];
    if (data.faultyDisplay) functionalIssues.push('Faulty Display');
    if (data.faultyEarpiece) functionalIssues.push('Faulty Earpiece');
    if (data.faultyFaceID) functionalIssues.push('Faulty Face ID');
    if (data.faultyProximitySensor) functionalIssues.push('Faulty Proximity Sensor');
    if (data.faultyVibrationMotor) functionalIssues.push('Faulty Vibration Motor');
    if (data.faultyPowerButton) functionalIssues.push('Faulty Power Button');
    if (data.faultyVolumeButton) functionalIssues.push('Faulty Volume Button');
    if (data.faultyMuteSwitch) functionalIssues.push('Faulty Mute Switch/Action Button');
    if (data.faultyFrontCamera) functionalIssues.push('Faulty Front Camera');
    if (data.faultyBackCamera) functionalIssues.push('Faulty Back Camera');
    if (data.faultyFlash) functionalIssues.push('Faulty Flash');
    if (data.faultySpeaker) functionalIssues.push('Faulty Speaker');
    if (data.faultyChargingPort) functionalIssues.push('Faulty Charging Port');

    // Collect physical damage
    const physicalDamage = [];
    if (data.damagedDisplay) physicalDamage.push('Damaged Display');
    if (data.damagedBack) physicalDamage.push('Damaged Back');
    if (data.damagedFrame) physicalDamage.push('Damaged Frame');
    if (data.damagedCamera) physicalDamage.push('Damaged Camera');

    // Collect repair history
    const repairHistory = [];
    if (data.repairedTouchScreen) repairHistory.push('Touch Screen');
    if (data.repairedDisplay) repairHistory.push('Display');
    if (data.repairedFrontCamera) repairHistory.push('Front Camera');
    if (data.repairedBackCamera) repairHistory.push('Back Camera');
    if (data.repairedLoudspeaker) repairHistory.push('Loudspeaker');
    if (data.repairedEarpiece) repairHistory.push('Earpiece');
    if (data.repairedMicrophone) repairHistory.push('Microphone');
    if (data.repairedBattery) repairHistory.push('Battery');
    if (data.otherRepairs) repairHistory.push(`Other: ${data.otherRepairs}`);

    const listingData = {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      priceNegotiable: true,
      condition: data.condition,
      conditionDetails: {
        screenCondition: `Front: ${data.cosmeticFront}, Back: ${data.cosmeticBack}, Frame: ${data.cosmeticFrame}`,
        bodyCondition: `${physicalDamage.length > 0 ? 'Damaged: ' + physicalDamage.join(', ') : 'No physical damage'}`,
        batteryHealth: data.batteryHealth || undefined,
        functionalIssues: [
          ...functionalIssues,
          ...(repairHistory.length > 0 ? [`Repair History: ${repairHistory.join(', ')}`] : [])
        ],
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
      accessories: {
        box: data.hasBox || false,
        charger: data.hasCharger || false,
        cable: data.hasCable || false,
        earphones: data.hasEarphones || false,
        case: false,
        screenProtector: false,
      },
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Images Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="mr-2">📸</span>
            <span className="bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Phone Images
            </span>
          </h2>
          
          <div className="mb-4 p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800 font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">📋</span> Required Photos:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">{imageTypes.map((imgType) => {
                const uploaded = images.some(img => img.type === imgType.type);
                return (
                  <motion.div
                    key={imgType.type}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: uploaded ? 1.05 : 1 }}
                    className={`flex items-start gap-2 p-2 rounded-lg ${uploaded ? 'bg-green-100 text-green-700 font-semibold' : 'bg-white text-gray-600'}`}
                  >
                    <span className="text-base">{uploaded ? '✅' : '⭕'}</span>
                    <div>
                      <div className="font-medium">{imgType.label}</div>
                      <div className={uploaded ? 'text-green-600' : 'text-gray-500'}>{imgType.description}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {getNextRequiredImageType() && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              className="mb-4 p-4 bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl shadow-sm"
            >
              <p className="text-sm text-yellow-900 font-semibold flex items-center gap-2">
                <span className="text-xl">👉</span>
                <strong>Next Up: </strong>
                {getNextRequiredImageType()?.label} - {getNextRequiredImageType()?.description}
              </p>
            </motion.div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Phone ${image.type}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                  <span className="text-white text-xs font-medium">
                    {imageTypes.find(t => t.type === image.type)?.label || image.type}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {images.length < 9 && (
              <div>
                <ImageUpload
                  key={images.length}
                  onUpload={handleImageUpload}
                  onImageChange={() => {}}
                />
              </div>
            )}
          </div>

          {isUploadingImage && (
            <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">
              <Loading size="sm" />
              <span className="font-semibold">Uploading image... ✨</span>
            </div>
          )}
        </motion.div>

        {/* Basic Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="mr-2">📝</span>
            <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Basic Information
            </span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Listing Title *
              </label>
              <input
                {...register('title')}
                className="input-field"
                placeholder="e.g., iPhone 14 Pro Max 256GB Silver - Excellent Condition"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="input-field"
                placeholder="Describe your phone's condition, accessories included, reason for selling, etc."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (PKR) *
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="input-field"
                placeholder="95000"
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Phone Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card bg-linear-to-br from-green-50 to-green-100 border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="mr-2">📱</span>
            <span className="bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Phone Details
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand *
              </label>
              <select {...register('brand')} className="input-field">
                <option value="">Select Brand</option>
                {BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              {errors.brand && (
                <p className="text-red-600 text-sm mt-1">{errors.brand.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <input
                {...register('model')}
                className="input-field"
                placeholder="iPhone 14 Pro Max"
              />
              {errors.model && (
                <p className="text-red-600 text-sm mt-1">{errors.model.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage *
              </label>
              <select {...register('storage')} className="input-field">
                <option value="">Select Storage</option>
                {STORAGE_OPTIONS.map((storage) => (
                  <option key={storage} value={storage}>
                    {storage}
                  </option>
                ))}
              </select>
              {errors.storage && (
                <p className="text-red-600 text-sm mt-1">{errors.storage.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition *
              </label>
              <select 
                {...register('condition')} 
                className="input-field"
                onChange={(e) => {
                  setSelectedCondition(e.target.value as keyof typeof CONDITION_INFO);
                }}
              >
                <option value="">Select Condition</option>
                {Object.entries(CONDITION_INFO).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="text-red-600 text-sm mt-1">{errors.condition.message}</p>
              )}
              
              {/* Condition Description */}
              {selectedCondition && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    {CONDITION_INFO[selectedCondition].icon} {CONDITION_INFO[selectedCondition].label}
                  </p>
                  <p className="text-sm text-blue-800">
                    {CONDITION_INFO[selectedCondition].description}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RAM (Optional)
              </label>
              <input
                {...register('ram')}
                className="input-field"
                placeholder="8GB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color *
              </label>
              <input
                {...register('color')}
                className="input-field"
                placeholder="Silver, Space Gray, Gold..."
              />
              {errors.color && (
                <p className="text-red-600 text-sm mt-1">{errors.color.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMEI (Optional, min 15 digits)
              </label>
              <input
                {...register('imei')}
                className="input-field"
                placeholder="123456789012345"
                maxLength={15}
              />
              {errors.imei && (
                <p className="text-red-600 text-sm mt-1">{errors.imei.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('warranty')}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Under Official Warranty
              </label>
            </div>
          </div>
        </motion.div>

        {/* Condition Details */}
        {/* ⚙️ Functionality Issues */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="mr-2">⚙️</span>
            <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Functionality Issues
            </span>
          </h2>
          <p className="text-gray-600 mb-4">✨ Select all that apply (leave unchecked if phone works perfectly)</p>
          
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyDisplay')} className="h-4 w-4 text-purple-600 rounded" />
              <span>📱 Faulty Display</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyEarpiece')} className="h-4 w-4 text-purple-600 rounded" />
              <span>🔊 Faulty Earpiece</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyFaceID')} className="h-4 w-4 text-purple-600 rounded" />
              <span>🔐 Faulty Face ID</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyProximitySensor')} className="h-4 w-4 text-purple-600 rounded" />
              <span>📡 Faulty Proximity Sensor</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyVibrationMotor')} className="h-4 w-4 text-purple-600 rounded" />
              <span>📳 Faulty Vibration Motor</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyPowerButton')} className="h-4 w-4 text-purple-600 rounded" />
              <span>🔘 Faulty Power Button</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyVolumeButton')} className="h-4 w-4 text-purple-600 rounded" />
              <span>🔊 Faulty Volume Button</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyMuteSwitch')} className="h-4 w-4 text-purple-600 rounded" />
              <span>🔇 Faulty Mute Switch/Action Button</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyFrontCamera')} className="h-4 w-4 text-purple-600 rounded" />
              <span>🤳 Faulty Front Camera</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyBackCamera')} className="h-4 w-4 text-purple-600 rounded" />
              <span>📷 Faulty Back Camera</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyFlash')} className="h-4 w-4 text-purple-600 rounded" />
              <span>💡 Faulty Flash</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultySpeaker')} className="h-4 w-4 text-purple-600 rounded" />
              <span>� Faulty Speaker</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('faultyChargingPort')} className="h-4 w-4 text-purple-600 rounded" />
              <span>🔌 Faulty Charging Port</span>
            </label>
          </div>
        </motion.div>

        {/* 💥 Physical Damage */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="card bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="mr-2">💥</span>
            <span className="bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Physical Damage
            </span>
          </h2>
          <p className="text-gray-600 mb-4">🔍 Select all types of damage (leave unchecked if no damage)</p>
          
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('damagedDisplay')} className="h-4 w-4 text-red-600 rounded" />
              <span>📱 Damaged Display</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('damagedBack')} className="h-4 w-4 text-red-600 rounded" />
              <span>🔄 Damaged Back</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('damagedFrame')} className="h-4 w-4 text-red-600 rounded" />
              <span>🔲 Damaged Frame</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('damagedCamera')} className="h-4 w-4 text-red-600 rounded" />
              <span>📷 Damaged Camera</span>
            </label>
          </div>
        </motion.div>

        {/* 🔧 Repair History */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="card bg-linear-to-br from-green-50 to-green-100 border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="mr-2">🔧</span>
            <span className="bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Repair History
            </span>
          </h2>
          <p className="text-gray-600 mb-4">🛠️ Select all parts that have been repaired or replaced</p>
          
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('repairedTouchScreen')} className="h-4 w-4 text-blue-600 rounded" />
              <span>📱 Touch Screen</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('repairedDisplay')} className="h-4 w-4 text-blue-600 rounded" />
              <span>🖥️ Display</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('repairedFrontCamera')} className="h-4 w-4 text-blue-600 rounded" />
              <span>🤳 Front Camera</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('repairedBackCamera')} className="h-4 w-4 text-blue-600 rounded" />
              <span>📷 Back Camera</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('repairedLoudspeaker')} className="h-4 w-4 text-blue-600 rounded" />
              <span>🔊 Loudspeaker</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('repairedEarpiece')} className="h-4 w-4 text-blue-600 rounded" />
              <span>👂 Earpiece</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('repairedMicrophone')} className="h-4 w-4 text-blue-600 rounded" />
              <span>🎤 Microphone</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" {...register('repairedBattery')} className="h-4 w-4 text-blue-600 rounded" />
              <span>🔋 Battery</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Repairs (Optional)
            </label>
            <input
              {...register('otherRepairs')}
              className="input-field"
              placeholder="Describe any other repairs..."
            />
          </div>
        </motion.div>

        {/* ✨ Cosmetic Condition */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="card bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="mr-2">✨</span>
            <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Cosmetic Condition
            </span>
          </h2>
          <p className="text-gray-600 mb-4">💎 Rate the physical appearance of each area</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Front Surface *
              </label>
              <select {...register('cosmeticFront')} className="input-field">
                <option value="excellent">⭐ Excellent - No visible wear</option>
                <option value="good">👍 Good - Minor wear</option>
                <option value="fair">📱 Fair - Noticeable wear</option>
              </select>
              {errors.cosmeticFront && (
                <p className="text-red-600 text-sm mt-1">{errors.cosmeticFront.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Back Surface *
              </label>
              <select {...register('cosmeticBack')} className="input-field">
                <option value="excellent">⭐ Excellent - No visible wear</option>
                <option value="good">👍 Good - Minor wear</option>
                <option value="fair">📱 Fair - Noticeable wear</option>
              </select>
              {errors.cosmeticBack && (
                <p className="text-red-600 text-sm mt-1">{errors.cosmeticBack.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frame/Edges *
              </label>
              <select {...register('cosmeticFrame')} className="input-field">
                <option value="excellent">⭐ Excellent - No visible wear</option>
                <option value="good">👍 Good - Minor wear</option>
                <option value="fair">📱 Fair - Noticeable wear</option>
              </select>
              {errors.cosmeticFrame && (
                <p className="text-red-600 text-sm mt-1">{errors.cosmeticFrame.message}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Battery Health (Apple Only) */}
        {watch('brand') === 'Apple' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="card bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-4">
              <span className="mr-2">🔋</span>
              <span className="bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Battery Health
              </span>
            </h2>
            <p className="text-gray-600 mb-4">⚡ Check in Settings → Battery → Battery Health</p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              {errors.batteryHealth && (
                <p className="text-red-600 text-sm mt-1">{errors.batteryHealth.message}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Accessories */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="card bg-linear-to-br from-green-50 to-green-100 border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="mr-2">📦</span>
            <span className="bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Included Accessories
            </span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('hasBox')}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                📦 Original Box
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('hasCharger')}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                🔌 Charger
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('hasCable')}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                🔗 Cable
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('hasEarphones')}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                🎧 Earphones
              </label>
            </div>
          </div>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="card bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">
            <span className="mr-2">📍</span>
            <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Location
            </span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <select {...register('city')} className="input-field">
                <option value="">Select City</option>
                {Object.entries(CITIES_BY_PROVINCE).map(([province, cities]) => (
                  <optgroup key={province} label={province}>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.city && (
                <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                {...register('address')}
                className="input-field"
                placeholder="Street address or area"
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-4"
        >
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="btn-secondary flex-1 hover:scale-105 transition-transform"
          >
            <span className="mr-2">❌</span>
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || isUploadingImage}
            className="btn-primary flex-1 bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loading size="sm" />
                <span className="font-bold">Creating Listing... ✨</span>
              </span>
            ) : (
              <span className="font-bold flex items-center gap-2">
                <span>🚀</span>
                <span>Create Listing</span>
              </span>
            )}
          </button>
        </motion.div>
      </form>

      {/* AI Inspection Loading Modal */}
      {isCreatingListing && (
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
                  🤖
                </div>
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2">
                <span className="bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Inspection in Progress
                </span>
              </h3>
              
              <p className="text-gray-600 mb-6">
                Our AI is analyzing your listing...
              </p>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-primary-600">{inspectionProgress}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${inspectionProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-linear-to-r from-primary-500 via-purple-500 to-pink-500"
                  />
                </div>
              </div>
              
              {/* Progress Steps */}
              <div className="space-y-2 text-left text-sm">
                <div className={`flex items-center gap-2 ${inspectionProgress >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                  {inspectionProgress >= 20 ? '✅' : '⏳'} Uploading images
                </div>
                <div className={`flex items-center gap-2 ${inspectionProgress >= 40 ? 'text-green-600' : 'text-gray-400'}`}>
                  {inspectionProgress >= 40 ? '✅' : '⏳'} Analyzing condition
                </div>
                <div className={`flex items-center gap-2 ${inspectionProgress >= 70 ? 'text-green-600' : 'text-gray-400'}`}>
                  {inspectionProgress >= 70 ? '✅' : '⏳'} Checking authenticity
                </div>
                <div className={`flex items-center gap-2 ${inspectionProgress >= 90 ? 'text-green-600' : 'text-gray-400'}`}>
                  {inspectionProgress >= 90 ? '✅' : '⏳'} Generating price suggestion
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-6">
                This usually takes 15-20 seconds ⏱️
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

