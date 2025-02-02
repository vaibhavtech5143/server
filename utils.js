import cloudinary from 'cloudinary'
import dotenv from 'dotenv';
dotenv.config()

 cloudinary.config({
    cloud_name: process.env.cloudinaryCloudName,
    api_key: process.env.cloudinaryApiKey,
    api_secret: process.env.cloudinaryApiSecret,
  });

  export default cloudinary

