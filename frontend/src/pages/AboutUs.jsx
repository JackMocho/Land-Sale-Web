import React from 'react';

export default function AboutUs() {
  return (
    <section className="relative w-full max-w-6xl mx-auto mt-0 mb-16 px-4 py-12 rounded-3xl shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full opacity-30 blur-2xl z-0"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-300 rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="relative z-10">
        <h2 className="text-4xl font-extrabold text-blue-900 mb-4 tracking-tight text-center drop-shadow-lg">
          About Us
        </h2>
        <p className="text-lg text-gray-700 mb-8 text-center max-w-3xl mx-auto">
          This is a modern, secure, and user-friendly platform dedicated to connecting buyers and sellers of land parcels across Kenya. We leverage geospatial technology to make land discovery and listing seamless, transparent, and accessible for all.
        </p>
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="flex-1 bg-white bg-opacity-80 rounded-2xl shadow-md p-6 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">Our Mission</h3>
            <p className="text-gray-700 text-center">
              To make land transactions transparent, accessible, and efficient for everyone.
            </p>
          </div>
          <div className="flex-1 bg-white bg-opacity-80 rounded-2xl shadow-md p-6 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">Our Vision</h3>
            <p className="text-gray-700 text-center">
              To be Kenya’s most trusted digital land marketplace, empowering communities and driving economic growth through transparent property transactions.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Why Choose Us?</h3>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>Verified and approved listings for peace of mind</li>
              <li>Integrated map and geospatial tools for easy geolocation</li>
              <li>Secure document and image management</li>
              <li>Professional support for buyers and sellers</li>
              <li>Modern, mobile-friendly design</li>
            </ul>
          </div>
          <div className="flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-600 rounded-2xl shadow p-6">
            
            <span className="text-xs text-gray-900">Empowering land transactions with technology</span>
          </div>
        </div>
      </div>
    </section>
  );
}