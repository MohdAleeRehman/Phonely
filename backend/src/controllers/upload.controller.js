import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import multer from 'multer';
import sharp from 'sharp';
import cloudinary from '../config/cloudinary.js';
import { nanoid } from 'nanoid';
import streamifier from 'streamifier';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
});

/**
 * @desc    Upload multiple images
 * @route   POST /api/v1/upload/images
 * @access  Private
 */
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('Please upload at least one image', 400);
  }

  const uploadPromises = req.files.map(async (file) => {
    try {
      // Check if Sharp supports the image format
      let imageBuffer = file.buffer;
      
      // For HEIC/HEIF files, try to process with Sharp
      // If Sharp doesn't have HEIC support, it will throw an error
      try {
        const metadata = await sharp(file.buffer).metadata();
        console.log(`Processing ${file.originalname} - format: ${metadata.format}`);
      } catch (metadataError) {
        console.error(`Unsupported format for ${file.originalname}:`, metadataError.message);
        
        // Check if it's a HEIC/HEIF format issue
        const isHEIC = file.originalname.toLowerCase().match(/\.(heic|heif)$/);
        if (isHEIC) {
          throw new AppError(
            `HEIC/HEIF images are not supported on this server. The image "${file.originalname}" should have been converted to JPG on your device. Please try again or contact support.`,
            400
          );
        }
        
        throw new AppError(
          `Unsupported image format: ${file.originalname}. Please use JPG, PNG, or WEBP images.`,
          400
        );
      }

      // Optimize image with Sharp - rotate() auto-fixes orientation from EXIF
      const optimizedBuffer = await sharp(imageBuffer)
        .rotate() // Auto-rotate based on EXIF orientation (fixes mobile camera issues)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Generate unique filename
      const filename = `${nanoid()}-${Date.now()}`;
      const folder = `${process.env.CLOUDINARY_FOLDER || 'phonely'}/listings/${req.user._id}`;

      // Upload to Cloudinary using stream
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: filename,
            resource_type: 'image',
            format: 'jpg',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ],
            tags: [req.user._id.toString(), 'listing'],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(optimizedBuffer).pipe(uploadStream);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        filename: result.public_id.split('/').pop(),
        size: result.bytes,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new AppError(`Failed to upload ${file.originalname}`, 500);
    }
  });

  const uploadedFiles = await Promise.all(uploadPromises);

  res.status(200).json({
    status: 'success',
    message: `${uploadedFiles.length} image(s) uploaded successfully`,
    data: {
      images: uploadedFiles,
    },
  });
});

/**
 * @desc    Delete an image from storage
 * @route   DELETE /api/v1/upload/images/:publicId
 * @access  Private
 */
export const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  
  // Decode the publicId (in case it contains slashes that were URL encoded)
  const decodedPublicId = decodeURIComponent(publicId);
  
  try {
    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === 'not found') {
      throw new AppError('Image not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new AppError('Failed to delete image', 500);
  }
});
