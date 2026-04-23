export default function Testimonials() {
  return (
    <section className="bg-[#b7c6c2] py-24 px-6 lg:px-12 border-b-2 border-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-16 text-center">
          Wall of Love
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="bg-white border-2 border-black p-8 shadow-neo rounded-[2px_1.5rem_2px_1.5rem] flex flex-col justify-between h-full">
              <div>
                <div className="flex gap-1 mb-4 text-[#febc2e] text-xl">
                  ★★★★★
                </div>
                <p className="font-bold text-lg mb-6 leading-snug">"This tool eliminated hours of manual pen-tool work. The brutalist UI is incredibly refreshing to use compared to boring standard dashboards."</p>
              </div>
              <div className="flex items-center gap-3 border-t-2 border-black pt-4">
                <div className="w-10 h-10 bg-[#171e19] border-2 border-black rounded-full"></div>
                <div>
                  <div className="font-heading font-black uppercase tracking-tighter text-xl leading-none">Alex R.</div>
                  <div className="text-sm font-medium uppercase text-gray-500">Art Director</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
