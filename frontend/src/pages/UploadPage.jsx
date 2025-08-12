import React from 'react';
import UploadWidget from '../components/UploadWidget';

const UploadPage = () => (
  <div className="min-h-screen bg-gray-50">
    <h1 className="text-2xl font-bold text-center mt-8">File Upload Demo</h1>
    <UploadWidget />
  </div>
);

export default UploadPage;
