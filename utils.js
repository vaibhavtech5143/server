import cloudinary from 'cloudinary'
import multer from 'multer'
import dotenv from 'dotenv';
dotenv.config()

 cloudinary.config({
    cloud_name: process.env.cloudinaryCloudName,
    api_key: process.env.cloudinaryApiKey,
    api_secret: process.env.cloudinaryApiSecret,
  });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
      const uniqueName = `${file.originalname}`; 
      cb(null, uniqueName);
    },
  });

  export const upload = multer({ storage: storage });
  export default cloudinary

