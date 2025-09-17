// src/pages/PropertyForm.jsx
import { useState } from 'react';
import MapLocationPicker from '../components/MapLocationPicker';
import MapCoordinatePicker from '../components/MapCoordinatePicker';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { kenyaCounties, constituenciesByCounty } from '../utils/kenyaLocations';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PropertyForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [tileLayer, setTileLayer] = useState('osm');
  const [boundary, setBoundary] = useState(null);

  const tileLayers = {
    osm: {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    },
    satellite: {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    size: '',
    sizeUnit: 'acres', // <-- Add this line
    type: 'residential',
    county: '',
    constituency: '',
    location: '',
    coordinates: '',
    images: [],
    documents: [],
    boundary: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'county') {
      setFormData(prev => ({ ...prev, constituency: '' }));
    }
  };

  // Upload images to backend and store returned URLs
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'my_upload_preset');
    const res = await fetch('https://api.cloudinary.com/v1_1/dvafn7u0q/image/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setImages(prev => [...prev, data.secure_url]); // Store only the URL
  };

  // Upload documents to backend and store returned URLs
  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'my_upload_preset');
      // Use /raw/upload for documents
      const res = await fetch('https://api.cloudinary.com/v1_1/dvafn7u0q/raw/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setDocuments(prev => [...prev, data.secure_url]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields before sending
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.size ||
      !formData.sizeUnit ||
      !formData.type ||
      !formData.county ||
      !formData.constituency ||
      !formData.location ||
      !formData.coordinates
    ) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        size: parseFloat(formData.size),
        sizeUnit: formData.sizeUnit || 'acres',
        type: formData.type,
        county: formData.county,
        constituency: formData.constituency,
        location: formData.location,
        coordinates: formData.coordinates,
        sellerId: user.id,
        images: Array.isArray(images) ? images : [],
        documents: Array.isArray(documents) ? documents : [],
        boundary: boundary || null
      };

      // Log payload for debugging
      console.log('Submitting property payload:', payload);

      await api.post('/properties', payload);

      alert('Congratulations! Your parcel has been successfully listed!');
      navigate('/seller-dashboard');
    } catch (err) {
      console.error('Submission error:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to list property. Please check your data and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const pickMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData(prev => ({
          ...prev,
          coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }));
      },
      () => {
        alert('Unable to retrieve your location.');
      }
    );
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">List Your Land Parcel</h1>
          <p className="text-gray-600">Reach thousands of buyers across Kenya</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-8">

          {/* Title */}
          <div>
            <label className="block text-gray-700 mb-2">Property Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="2-Acre Residential Plot, Ruiru"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the land, access, water, electricity, nearby amenities, etc."
              required
            ></textarea>
          </div>

          {/* Price & Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Price (KES)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="4500000"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Land Size</label>
              <div className="flex">
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-l focus:ring-2 focus:ring-blue-500"
                  placeholder="2"
                  required
                />
                <select
                  name="sizeUnit"
                  value={formData.sizeUnit || 'acres'}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 rounded-r bg-gray-50"
                >
                  <option value="acres">acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-gray-700 mb-2">Property Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="residential">Residential</option>
              <option value="agricultural">Agricultural</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">County</label>
              <select
                name="county"
                value={formData.county}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select County</option>
                {kenyaCounties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Constituency</label>
              <select
                name="constituency"
                value={formData.constituency}
                onChange={handleChange}
                disabled={!formData.county}
                className={`w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 ${!formData.county ? 'bg-gray-100' : ''}`}
              >
                <option value="">{formData.county ? 'Select Constituency' : 'Select County First'}</option>
                {formData.county && constituenciesByCounty[formData.county]?.map(constituency => (
                  <option key={constituency} value={constituency}>{constituency}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Exact Location (e.g. near school, road)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Along Thika Road, near Greenfield Estate"
              required
            />
          </div>

          {/* Coordinates with Map Picker */}
          <div>
            <label className="block text-gray-700 mb-2">Set Location on Map</label>
            <p className="text-sm text-gray-500 mb-2">Click on the map to set the land parcel location</p>
            <div className="flex items-center gap-4 mb-2">
              <MapLocationPicker
                onLocationSelect={(coords) => {
                  setFormData(prev => ({
                    ...prev,
                    coordinates: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
                  }));
                }}
                tileLayer={tileLayers[tileLayer]}
              />
            </div>
            <button
              type="button"
              onClick={pickMyLocation}
              className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm shadow"
            >
              Pick My Location
            </button>
            {formData.coordinates && (
              <p className="text-sm text-gray-600 mt-2">
                Selected Coordinates: {formData.coordinates}
              </p>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-gray-700 mb-2">Property Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => {
                const files = Array.from(e.target.files);
                files.forEach(file => handleImageUpload(file));
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {images.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt="Preview" className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="block text-gray-700 mb-2">Land Documents (Title Deed, Survey Map, etc.)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              multiple
              onChange={handleDocumentUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-blue-900 hover:file:bg-yellow-600"
            />
            <div className="mt-4 space-y-2">
              {documents.map((url, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span className="text-sm truncate">Document {index + 1}</span>
                  <button
                    onClick={() => removeDocument(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="secondary" fullWidth disabled={loading}>
              {loading ? 'Uploading Property...' : 'List Property'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}