import dotenv from "dotenv";
import cloudinary from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (!cloud_name || !api_key || !api_secret) {
  console.error("[Cloudinary Error] Missing environment variables:");
  if (!cloud_name) console.error("  - CLOUDINARY_CLOUD_NAME is missing");
  if (!api_key) console.error("  - CLOUDINARY_API_KEY is missing");
  if (!api_secret) console.error("  - CLOUDINARY_API_SECRET is missing");
  process.exit(1);
}

cloudinary.v2.config({
  cloud_name,
  api_key,
  api_secret,
});

const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "kontrivibe/posts",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "mp4",
      "mov",
      "avi",
      "mp3",
      "wav",
      "m4a",
    ],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "kontrivibe/profiles",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

export const uploadPost = multer({
  storage: postStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "audio/mpeg",
      "audio/wav",
      "audio/mp4",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images (JPG, PNG, GIF, WebP), videos (MP4, MOV, AVI), and audio (MP3, WAV, M4A) are allowed."
        )
      );
    }
  },
});

export const uploadProfile = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
        )
      );
    }
  },
});

export default cloudinary.v2;
