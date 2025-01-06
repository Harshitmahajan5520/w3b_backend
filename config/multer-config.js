import  cloudinary from './cloudinary-config.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], 
  },
});

const upload = multer({ storage });

const uploadFields = [
  { name: 'qrCode', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'teamHeadImage', maxCount: 1 }, // For team head profile picture
  { name: 'memberImage', maxCount: 1 }, // For team member profile pictures
];

const uploadMiddleware = upload.fields(uploadFields);

export default uploadMiddleware;
