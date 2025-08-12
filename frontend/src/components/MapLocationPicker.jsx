import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState, useRef } from 'react';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const kenyaBounds = [
  [-4.66, 33.92],
  [5.26, 41.89]
];

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

function LocationMarker({ marker, setMarker, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarker({ lat, lng });
      if (onLocationSelect) onLocationSelect({ lat, lng });
    }
  });
  return marker ? <Marker position={[marker.lat, marker.lng]} /> : null;
}

export default function MapLocationPicker({
  onLocationSelect,
  defaultCenter = [-1.2833, 36.8167],
  zoom = 7,
  tileLayer: tileLayerProp
}) {
  const [marker, setMarker] = useState(null);
  const [tileLayer, setTileLayer] = useState(tileLayerProp?.name === 'Satellite' ? 'satellite' : 'osm');
  const mapRef = useRef();

  // Pick My Location handler
  const pickMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMarker({ lat, lng });
        if (onLocationSelect) onLocationSelect({ lat, lng });
        // Pan map to marker
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }
      },
      () => {
        alert('Unable to retrieve your location.');
      }
    );
  };

  return (
    <div className="relative h-72 w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={marker ? [marker.lat, marker.lng] : defaultCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        maxBounds={kenyaBounds}
        maxBoundsViscosity={1.0}
        className="min-h-[18rem] w-full"
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
      >
        <TileLayer
          key={tileLayer}
          attribution={tileLayers[tileLayer].attribution}
          url={tileLayers[tileLayer].url}
        />
        <LocationMarker marker={marker} setMarker={setMarker} onLocationSelect={onLocationSelect} />
      </MapContainer>

      {/* Pick My Location Button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <button
          type="button"
          onClick={pickMyLocation}
          className="bg-blue-900 text-white px-4 py-2 rounded shadow hover:bg-blue-800 text-sm"
        >
          Pick My Location
        </button>
      </div>

      {/* Tile switcher at bottom center */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="bg-white border border-gray-300 rounded shadow px-2 py-1 flex space-x-2">
          <button
            type="button"
            className={`px-3 py-1 rounded text-sm transition ${tileLayer === 'osm' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
            onClick={() => setTileLayer('osm')}
          >
            OpenStreetMap
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded text-sm transition ${tileLayer === 'satellite' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
            onClick={() => setTileLayer('satellite')}
          >
            Satellite
          </button>
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
        <strong>Pick Location</strong><br />
        Click anywhere on the map or use "Pick My Location" to set the land parcel location. Only one marker is allowed.
      </div>
      {marker && (
        <div className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded">
          <strong>Location Picked:</strong> Lat: {marker.lat.toFixed(6)}, Lng: {marker.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}