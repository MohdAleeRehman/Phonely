import { motion } from 'framer-motion';
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
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          <span className="mr-3">📸</span>
          Photo Time!
        </h2>
        <p className="text-gray-600">Upload clear photos of your phone from different angles</p>
      </div>

      {/* Image Types Guide */}
      <div className="p-5 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
        <p className="text-sm text-blue-900 font-bold mb-3 flex items-center gap-2">
          <span className="text-lg">📋</span> Required Photos:
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
                  uploaded ? 'bg-green-100 text-green-700 font-semibold shadow-sm' : 'bg-white text-gray-600'
                }`}
              >
                <span className="text-base">{uploaded ? '✅' : '⭕'}</span>
                <div>
                  <div className="font-medium">{imgType.label}</div>
                  <div className={`text-xs ${uploaded ? 'text-green-600' : 'text-gray-500'}`}>
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
          className="p-4 bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl shadow-sm"
        >
          <p className="text-sm text-yellow-900 font-semibold flex items-center gap-2">
            <span className="text-xl">👉</span>
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
        <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-4 rounded-lg">
          <Loading size="sm" />
          <span className="font-semibold">Uploading image... ✨</span>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <span className="text-4xl mb-2 block">📷</span>
          <p className="text-gray-600">Upload at least one photo to continue</p>
        </div>
      )}
    </motion.div>
  );
}
