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

// Define upload fields configuration
const uploadFields = [
  { name: 'qrCode', maxCount: 1 },
  { name: 'images', maxCount: 10 }
];

// Create middleware using fields() directly
const uploadMiddleware = upload.fields(uploadFields);

export default uploadMiddleware;
















// const uploadMiddleware = (req, res, next) => {
//   upload(req, res, (err) => {
//     if (err instanceof multer.MulterError) {
//       return res.status(400).json({ error: `Multer error: ${err.message}` }); 
//     } else if (err) {
//       return res.status(500).json({ error: `Unexpected error: ${err.message}` });
//     }
//     next(); 
//   });
// };

// export default uploadMiddleware;

// const uploadMiddleware = (req, res, next) => {
//   const uploadHandler = upload.fields(uploadFields);
  
//   uploadHandler(req, res, (err) => {
//     if (err instanceof multer.MulterError) {
//       return res.status(400).json({ error: `Multer error: ${err.message}` });
//     } else if (err) {
//       return res.status(500).json({ error: `Unexpected error: ${err.message}` });
//     }
//     next();
//   });
// };

// export default uploadMiddleware;