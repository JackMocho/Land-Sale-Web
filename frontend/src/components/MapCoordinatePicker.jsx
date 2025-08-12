// src/components/MapCoordinatePicker.jsx
import { MapContainer, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { EditControl } from "react-leaflet-draw";
import { useState } from 'react';

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

export default function MapCoordinatePicker({
  onBoundaryChange,
  defaultCenter = [-1.2833, 36.8167],
  zoom = 7,
  boundary: boundaryProp,
  tileLayer: tileLayerProp
}) {
  const [boundary, setBoundary] = useState(boundaryProp || null);
  const [tileLayer, setTileLayer] = useState(tileLayerProp?.name === 'Satellite' ? 'satellite' : 'osm');

  const handleBoundaryChange = geoJson => {
    setBoundary(geoJson);
    if (onBoundaryChange) onBoundaryChange(geoJson);
  };

  return (
    <div className="relative h-72 w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        maxBounds={kenyaBounds}
        maxBoundsViscosity={1.0}
        className="min-h-[18rem] w-full"
      >
        <TileLayer
          key={tileLayer}
          attribution={tileLayers[tileLayer].attribution}
          url={tileLayers[tileLayer].url}
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={e => {
              if (e.layerType === 'polygon') {
                const geoJson = e.layer.toGeoJSON();
                handleBoundaryChange(geoJson);
              }
            }}
            onEdited={e => {
              e.layers.eachLayer(layer => {
                const geoJson = layer.toGeoJSON();
                handleBoundaryChange(geoJson);
              });
            }}
            onDeleted={() => handleBoundaryChange(null)}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: {
                  color: "#2563eb",
                  fillColor: "#93c5fd",
                  fillOpacity: 0.4,
                  weight: 3,
                },
                selectedPathOptions: {
                  color: "#16a34a",
                  fillColor: "#bbf7d0",
                  fillOpacity: 0.5,
                  weight: 4,
                },
                drawError: {
                  color: "#e11d48",
                  message: "Polygon needs at least 3 points. Double-click to finish when ready.",
                  timeout: 1200,
                  type: "polygon"
                },
              },
            }}
          />
          {boundary && (
            <Polygon
              positions={boundary.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#93c5fd",
                fillOpacity: 0.4,
                weight: 3,
              }}
            />
          )}
        </FeatureGroup>
      </MapContainer>

      {/* Tile layer switcher */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-10 flex items-center bg-white bg-opacity-90 rounded shadow px-4 py-2 space-x-4">
        <span className="font-medium text-gray-700">Map Type:</span>
        <button
          type="button"
          className={`px-3 py-1 rounded ${tileLayer === 'osm' ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTileLayer('osm')}
        >
          OpenStreetMap
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded ${tileLayer === 'satellite' ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTileLayer('satellite')}
        >
          Satellite
        </button>
      </div>

      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
        <strong>Draw Land Boundary (Optional)</strong><br />
        Click the polygon tool (<span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded mx-1">👆</span>) and draw around your land parcel. Double-click to finish. You can add as many points as needed before closing.
      </div>
      {boundary && (
        <div className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
          <strong>Boundary Set</strong> – {boundary.geometry.coordinates[0].length - 1} points
        </div>
      )}
    </div>
  );
}