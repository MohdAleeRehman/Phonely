import { motion } from 'framer-motion';
import { Camera, CheckCircle2, Circle, Sparkles, ArrowRight, FileText } from 'lucide-react';
import ImageUpload from '../../common/ImageUpload';
import Loading from '../../common/Loading';

interface Image {
  url: string;
  type: string;
}

interface ImageType {
  type: string;
  label: string;
  description: string;
}

interface ImagesStepProps {
  images: Image[];
  isUploadingImage: boolean;
  handleImageUpload: (file: File) => Promise<string>;
  removeImage: (index: number) => void;
  imageTypes: ImageType[];
}

export default function ImagesStep({
  images,
  isUploadingImage,
  handleImageUpload,
  removeImage,
  imageTypes,
}: ImagesStepProps) {
  const getNextRequiredImageType = () => {
    for (const imageType of imageTypes) {
      if (!images.some(img => img.type === imageType.type)) {
        return imageType;
      }
    }
    return null;
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <Camera className="w-8 h-8 text-cyan-400" />
          Photo Time!
        </h2>
        <p className="text-gray-300">Upload clear photos of your phone from different angles</p>
      </div>

      {/* Image Types Guide */}
      <div className="p-5 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-400/30">
        <p className="text-sm text-blue-300 font-bold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Required Photos:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {imageTypes.map((imgType) => {
            const uploaded = images.some(img => img.type === imgType.type);
            return (
              <motion.div
                key={imgType.type}
                initial={{ scale: 0.9 }}
                animate={{ scale: uploaded ? 1.05 : 1 }}
                className={`flex items-start gap-2 p-3 rounded-lg transition-all ${
                  uploaded ? 'bg-green-500/20 text-green-300 font-semibold shadow-sm border border-green-400/30' : 'bg-white/5 text-gray-300 border border-white/10'
                }`}
              >
                {uploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 shrink-0" />
                )}
                <div>
                  <div className="font-medium">{imgType.label}</div>
                  <div className={`text-xs ${uploaded ? 'text-green-400' : 'text-gray-400'}`}>
                    {imgType.description}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Next Photo Indicator */}
      {getNextRequiredImageType() && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
          className="p-4 bg-yellow-500/20 backdrop-blur-md border border-yellow-400/30 rounded-xl shadow-sm"
        >
          <p className="text-sm text-yellow-300 font-semibold flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            <strong>Next Up: </strong>
            {getNextRequiredImageType()?.label} - {getNextRequiredImageType()?.description}
          </p>
        </motion.div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image.url}
              alt={`Phone ${image.type}`}
              className="w-full h-32 object-cover rounded-lg shadow-md"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-2 rounded-b-lg">
              <span className="text-white text-xs font-medium">
                {imageTypes.find(t => t.type === image.type)?.label || image.type}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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
        <div className="flex items-center gap-2 text-sm text-purple-300 bg-purple-500/20 border border-purple-500/50 p-4 rounded-lg backdrop-blur-sm">
          <Loading size="sm" />
          <span className="font-semibold flex items-center gap-2">
            Uploading image...
            <Sparkles className="w-4 h-4" />
          </span>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center p-8 bg-white/5 rounded-xl border-2 border-dashed border-gray-500">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300">Upload at least one photo to continue</p>
        </div>
      )}
    </motion.div>
  );
}
