import React from 'react';

export default function AboutUs() {
  return (
    <>
    <section className="max-w-4xl mx-auto my-16 px-6 py-12 bg-white rounded-2xl shadow-2xl opacity-95 transition hover:scale-101 hover:shadow-3xl">
        <div>
      <h2 className="text-3xl font-extrabold text-blue-900 mb-4 tracking-tight">About Us </h2>
      <p className="text-lg text-gray-700 mb-6">
        This web Land Marketplace is a modern, secure, and user-friendly platform dedicated to connecting buyers and sellers of land parcels across Kenya.</p>
        </div>
        <div className="bg-slate-100 ">
        <h1 className="text-2xl text-orange-950 p-1">Our Mission </h1>
         To make land transactions transparent, accessible, and efficient for everyone.
         </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-zinc-100 p-5">
          <h3 className="text-2xl font-bold text-blue-800 mb-2">Why Choose Us?</h3>
          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Verified and approved listings for peace of mind</li>
            <li>Integrated map and geospatial to ease geolocation</li>
            <li>Secure document and image management</li>
            <li>Professional support for buyers and sellers</li>
            <li>Modern web, mobile-friendly design</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold text-blue-800 mb-2">Our Vision</h3>
          <p className="text-gray-700">
            To be Kenya’s most trusted digital land marketplace, empowering communities and driving economic growth through transparent property transactions.
          </p>
          <h3 className="text-xl font-bold text-blue-800 mt-6 mb-2">Contacts</h3>
          <p className="text-gray-700">
            Email: <a href="mailto:emissarygeospatials@gmail.com" className="text-blue-700 underline">emissarygeospatials@gmail.com</a><br />
            Phone: <span className="text-blue-700">+254 745 420 900</span>
          </p>
        </div>
      </div>
      
    </section>
    </>
  );
}