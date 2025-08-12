require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://land-sale-frontend.onrender.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (store files temporarily)
const upload = multer({ dest: 'uploads/' });

// Upload endpoint (image/pdf)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    // Only allow images and PDFs
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(fileType)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Only images and PDFs are allowed.' });
    }
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: fileType === 'application/pdf' ? 'raw' : 'image',
      folder: 'land-sale-uploads',
    });
    fs.unlinkSync(filePath); // Remove temp file
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
