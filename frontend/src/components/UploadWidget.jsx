import React, { useState } from 'react';
import axios from 'axios';

const UploadWidget = () => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [type, setType] = useState('image');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cloudinary Widget
  const openCloudinaryWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'your_cloud_name', // Replace with your Cloudinary cloud name
        uploadPreset: 'your_unsigned_preset', // Replace with your unsigned preset
        sources: ['local', 'url', 'camera', 'dropbox', 'google_drive'],
        resourceType: type === 'pdf' ? 'raw' : 'image',
        multiple: false,
        folder: 'land-sale-uploads',
        clientAllowedFormats: type === 'pdf' ? ['pdf'] : ['jpg', 'png', 'jpeg'],
        maxFileSize: 10485760, // 10MB
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          setUrl(result.info.secure_url);
        }
      }
    );
  };

  // Direct upload to backend (secure for PDFs)
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUrl(res.data.url);
    } catch (err) {
      setError('Upload failed.');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto mt-8">
      <h2 className="text-lg font-bold mb-2">Upload Image or PDF</h2>
      <div className="mb-2">
        <label>
          <input
            type="radio"
            name="type"
            value="image"
            checked={type === 'image'}
            onChange={() => setType('image')}
          />{' '}
          Image
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="type"
            value="pdf"
            checked={type === 'pdf'}
            onChange={() => setType('pdf')}
          />{' '}
          PDF (Title Deed)
        </label>
      </div>
      {type === 'image' ? (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
          type="button"
          onClick={openCloudinaryWidget}
        >
          Upload Image via Cloudinary Widget
        </button>
      ) : (
        <div className="mb-2">
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
            type="button"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>
      )}
      {url && (
        <div className="mt-4">
          <p className="font-semibold">Uploaded File URL:</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {url}
          </a>
        </div>
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default UploadWidget;
