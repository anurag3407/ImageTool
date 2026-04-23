import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 lg:px-12 bg-neo-dots">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col items-start gap-6">
          <div className="bg-white border-2 border-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-neo inline-block">
            NEW: AI Content Assistant 2.0
          </div>
          <h1 className="font-heading text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
            Remove Backgrounds <br/>
            <span className="text-stroke-neo">Instantly.</span>
          </h1>
          <p className="text-xl lg:text-2xl font-medium max-w-lg mb-4">
            Professional grade image processing directly in your browser. Built for speed, precision, and zero-compromise design.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="btn-neo text-lg">Start Creating</Link>
          </div>
        </div>
        <div className="relative z-10 hidden lg:block">
          <div className="bg-white border-2 border-black rounded-2xl shadow-[12px_12px_0px_0px_#000000] overflow-hidden flex flex-col h-[500px]">
            <div className="bg-black p-3 flex gap-2 border-b-2 border-black">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            </div>
            <div className="flex-1 bg-[#171e19] p-8 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">✨</span>
                <h3 className="font-heading text-3xl text-white font-black uppercase tracking-tighter">Your Dashboard Awaits</h3>
                <p className="text-gray-400 mt-2 font-bold">Log in to unleash the magic.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
