// src/pages/PropertyDetail.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await api.get(`/properties/${id}`);
        // Ensure images is always an array
        let images = [];
        if (Array.isArray(res.data.images)) {
          images = res.data.images;
        } else if (typeof res.data.images === 'string' && res.data.images.length > 0) {
          try {
            images = JSON.parse(res.data.images);
          } catch {
            images = [res.data.images];
          }
        }
        // Prefix /uploads/ with backend URL
        const fixedImages = images.map(url =>
          url && url.startsWith('/uploads/')
            ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`
            : url
        );
        setProperty({ ...res.data, images: fixedImages });

        // Fetch seller info using sellerid
        if (res.data.sellerId) {
          const sellerRes = await api.get(`/users/${res.data.sellerId}`);
          setSeller(sellerRes.data);
        } else {
          setSeller(null);
        }
      } catch (err) {
        setProperty(null);
        setSeller(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!property) return <div className="p-8 text-red-600">Property not found.</div>;

  // Parse coordinates
  let markerPosition = null;
  if (property.coordinates) {
    const [lat, lng] = property.coordinates.split(',').map(Number);
    markerPosition = [lat, lng];
  }

  // Parse boundary
  let boundaryPositions = null;
  if (property.boundary) {
    try {
      const geoJson = typeof property.boundary === 'string' ? JSON.parse(property.boundary) : property.boundary;
      boundaryPositions = geoJson.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
    } catch {}
  }

  // Swipe image handlers
  const handlePrevImage = () => {
    setCurrentImage((prev) =>
      property.images && property.images.length > 0
        ? (prev - 1 + property.images.length) % property.images.length
        : 0
    );
  };
  const handleNextImage = () => {
    setCurrentImage((prev) =>
      property.images && property.images.length > 0
        ? (prev + 1) % property.images.length
        : 0
    );
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
        <div className="mb-4 text-gray-700">
          <p><strong>Description:</strong> {property.description}</p>
          <p><strong>Price:</strong> KES {property.price?.toLocaleString()}</p>
          <p><strong>Size:</strong> {property.size} {property.sizeUnit}</p>
          <p><strong>Type:</strong> {property.type}</p>
          <p><strong>County:</strong> {property.county}</p>
          <p><strong>Constituency:</strong> {property.constituency}</p>
          <p><strong>Location:</strong> {property.location}</p>
          <p>
            <strong>Seller Name:</strong> {seller?.name || 'Not available'}
          </p>
          <p>
            <strong>Seller Phone:</strong> {seller?.phone || 'Not available'}
          </p>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Map</h2>
          <div className="h-80 w-full rounded-lg overflow-hidden shadow">
            <MapContainer
              center={markerPosition || [-1.2833, 36.8167]}
              zoom={markerPosition ? 14 : 7}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {markerPosition && <Marker position={markerPosition} />}
              {boundaryPositions && (
                <Polygon
                  positions={boundaryPositions}
                  pathOptions={{
                    color: "#2563eb",
                    fillColor: "#93c5fd",
                    fillOpacity: 0.4,
                    weight: 3,
                  }}
                />
              )}
            </MapContainer>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Photos</h2>
          <div className="flex flex-col items-center">
            {(property.images && property.images.length > 0) ? (
              <div className="relative w-full flex flex-col items-center">
                <img
                  src={property.images[currentImage]}
                  alt={`Preview ${currentImage + 1}`}
                  className="w-full h-64 object-cover rounded shadow"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="flex justify-between items-center w-full mt-2">
                  <button
                    onClick={handlePrevImage}
                    className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    &#8592; Prev
                  </button>
                  <span className="text-gray-700 font-semibold">
                    {currentImage + 1} / {property.images.length}
                  </span>
                  <button
                    onClick={handleNextImage}
                    className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Next &#8594;
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No photos available for this listing.</p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Documents</h2>
          {Array.isArray(property.documents) && property.documents.length > 0 ? (
            <ul className="list-disc ml-6">
              {property.documents.map((docUrl, idx) => (
                <li key={idx}>
                  <a
                    href={docUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline"
                  >
                    Download Document {idx + 1}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No documents available for this listing.</p>
          )}
        </div>
      </div>
    </div>
  );
}