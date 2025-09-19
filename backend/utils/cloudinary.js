// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a document (PDF, DOC, etc.) as a raw resource
async function uploadDocument(filePath) {
  return cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder: 'documents',
    use_filename: true,
    unique_filename: false,
    overwrite: false,
  });
}

module.exports = {
  cloudinary,
  uploadDocument,
};