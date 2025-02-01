import cloudinary from 'cloudinary'
import multer from 'multer'
import dotenv from 'dotenv';
dotenv.config()
console.log("innn ", process.env.cloudinaryApiKey);

 cloudinary.config({
    cloud_name: process.env.cloudinaryCloudName,
    api_key: process.env.cloudinaryApiKey,
    api_secret: process.env.cloudinaryApiSecret,
  });

  export default cloudinary

