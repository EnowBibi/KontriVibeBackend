import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads/images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const uploadImage = multer({ storage: imageStorage });

// Storage for videos (optional)
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads/videos",
    allowed_formats: ["mp4", "mov", "avi", "mkv"],
    resource_type: "video",
  },
});

const uploadVideo = multer({ storage: videoStorage });

export { cloudinary, imageStorage, uploadImage, uploadVideo };
