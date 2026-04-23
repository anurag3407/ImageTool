export default function Features() {
  return (
    <>
      {/* PROBLEM VS SOLUTION */}
      <section id="features" className="bg-white py-24 px-6 lg:px-12 border-b-2 border-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-16 text-center">
            Stop Wasting Time
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#f4f4f5] border-2 border-dashed border-gray-400 p-10 rounded-3xl opacity-70">
              <h3 className="font-heading text-3xl font-extrabold uppercase mb-6 border-b-2 border-gray-300 pb-4">The Old Way</h3>
              <ul className="flex flex-col gap-4 font-medium text-lg">
                <li className="flex items-center gap-3"><span className="text-xl font-black text-red-500">✕</span> Manual lasso tool</li>
                <li className="flex items-center gap-3"><span className="text-xl font-black text-red-500">✕</span> Server upload limits</li>
                <li className="flex items-center gap-3"><span className="text-xl font-black text-red-500">✕</span> Losing image quality</li>
                <li className="flex items-center gap-3"><span className="text-xl font-black text-red-500">✕</span> Complex UI dashboards</li>
              </ul>
            </div>
            <div className="bg-[#ffe17c] border-2 border-black shadow-neo-lg p-10 rounded-3xl relative z-10">
              <div className="absolute -top-5 -right-5 bg-black text-white font-bold text-xs uppercase px-3 py-1 border-2 border-black shadow-neo transform rotate-12">Solution</div>
              <h3 className="font-heading text-3xl font-extrabold uppercase mb-6 border-b-2 border-black pb-4">ImageTool Way</h3>
              <ul className="flex flex-col gap-4 font-bold text-lg">
                <li className="flex items-center gap-3"><span className="w-6 h-6 bg-black text-[#ffe17c] rounded-full flex items-center justify-center text-sm">✓</span> 100% AI Automated</li>
                <li className="flex items-center gap-3"><span className="w-6 h-6 bg-black text-[#ffe17c] rounded-full flex items-center justify-center text-sm">✓</span> Direct to Cloudinary</li>
                <li className="flex items-center gap-3"><span className="w-6 h-6 bg-black text-[#ffe17c] rounded-full flex items-center justify-center text-sm">✓</span> Crystal clear PNGs</li>
                <li className="flex items-center gap-3"><span className="w-6 h-6 bg-black text-[#ffe17c] rounded-full flex items-center justify-center text-sm">✓</span> Neo-Brutalist efficiency</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="bg-[#ffe17c] py-24 px-6 lg:px-12 border-b-2 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Lightning Fast", desc: "Local WASM processing means zero server roundtrips for AI inference." },
              { title: "Secure Storage", desc: "Images bypass standard servers, heading straight to your secure Cloudinary bucket." },
              { title: "Multi-User", desc: "Built-in auth ensures your uploads are yours alone, safely stored via MongoDB." }
            ].map((feat, i) => (
              <div key={i} className="bg-white border-2 border-black p-8 shadow-neo group hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 bg-[#b7c6c2] border-2 border-black mb-6 flex items-center justify-center shadow-neo group-hover:bg-[#ffe17c] transition-colors">
                  <div className="w-6 h-6 bg-black"></div>
                </div>
                <h3 className="font-heading text-2xl font-black uppercase tracking-tighter mb-3">{feat.title}</h3>
                <p className="font-medium text-lg leading-snug">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
