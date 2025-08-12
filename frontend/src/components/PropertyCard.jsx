// src/components/PropertyCard.jsx
import { Link } from 'react-router-dom';

export default function PropertyCard({ property }) {
  return (
    <Link to={`/property/${property.id}`} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <img src={property.image} alt={property.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold">{property.title}</h3>
        <p className="text-blue-900 font-bold">{property.price}</p>
        <p className="text-gray-600 text-sm">{property.location}</p>
        <p className="text-gray-500">{property.size} • {property.type}</p>
      </div>
    </Link>
  );
}