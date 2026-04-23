export default function Personas() {
  return (
    <section className="bg-white py-24 px-6 lg:px-12 border-b-2 border-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#b7c6c2] border-2 border-black p-8 shadow-neo relative pt-12">
            <span className="absolute top-4 left-4 bg-white text-black font-bold text-xs uppercase px-3 py-1 border-2 border-black rounded-full">Designers</span>
            <h3 className="font-heading text-3xl font-black uppercase tracking-tighter mb-4">Clean Assets</h3>
            <p className="font-medium text-lg border-t-2 border-black pt-4">Perfect cutouts for marketing materials without touching Photoshop.</p>
          </div>
          
          <div className="bg-[#ffe17c] border-2 border-black p-8 shadow-neo-lg relative pt-12 transform md:-translate-y-4">
            <span className="absolute top-4 left-4 bg-white text-black font-bold text-xs uppercase px-3 py-1 border-2 border-black rounded-full">E-Commerce</span>
            <h3 className="font-heading text-3xl font-black uppercase tracking-tighter mb-4">Product Shots</h3>
            <p className="font-medium text-lg border-t-2 border-black pt-4">Uniform backgrounds for your entire catalog in seconds flat.</p>
          </div>

          <div className="bg-[#272727] text-white border-2 border-black p-8 shadow-neo relative pt-12">
            <span className="absolute top-4 left-4 bg-white text-black font-bold text-xs uppercase px-3 py-1 border-2 border-black rounded-full">Developers</span>
            <h3 className="font-heading text-3xl font-black uppercase tracking-tighter mb-4">API Ready</h3>
            <p className="font-medium text-lg border-t-2 border-black pt-4 text-gray-300">Cloudinary links ready to be injected straight into your UI.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
