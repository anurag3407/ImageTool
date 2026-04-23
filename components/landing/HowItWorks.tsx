export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#171e19] text-white py-24 px-6 lg:px-12 border-b-2 border-black">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="font-heading text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-20">How It Works</h2>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0">
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-[#272727] z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center max-w-[250px]">
            <div className="w-24 h-24 rounded-full border-4 border-[#b7c6c2] bg-[#171e19] flex items-center justify-center font-heading text-4xl font-black mb-6 shadow-[0_0_20px_rgba(183,198,194,0.3)]">1</div>
            <h4 className="font-heading text-2xl font-extrabold uppercase mb-2">Upload</h4>
            <p className="text-gray-400 font-medium">Drag and drop any image format into the dashboard.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-[250px]">
            <div className="w-24 h-24 rounded-full border-4 border-[#ffe17c] bg-[#171e19] flex items-center justify-center font-heading text-4xl font-black mb-6 shadow-[0_0_20px_rgba(255,225,124,0.3)]">2</div>
            <h4 className="font-heading text-2xl font-extrabold uppercase mb-2">Process</h4>
            <p className="text-gray-400 font-medium">WASM AI instantly strips the background perfectly.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-[250px]">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-[#171e19] flex items-center justify-center font-heading text-4xl font-black mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]">3</div>
            <h4 className="font-heading text-2xl font-extrabold uppercase mb-2">Deploy</h4>
            <p className="text-gray-400 font-medium">Link is securely stored in MongoDB and ready to copy.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
