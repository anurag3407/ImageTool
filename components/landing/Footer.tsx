import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#171e19] text-white">
      <div className="bg-[#ffe17c] text-black border-b-2 border-black py-24 px-6 text-center">
        <h2 className="font-heading text-6xl lg:text-8xl font-black uppercase tracking-tighter mb-8 max-w-4xl mx-auto">
          Ready to break the mold?
        </h2>
        <Link href="/dashboard" className="btn-neo text-2xl px-12 py-6 inline-flex">Start Processing Now</Link>
      </div>
      
      <div className="py-16 px-6 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b-2 border-[#272727]">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-white flex items-center justify-center border-2 border-black">
              <span className="text-black font-black text-xl leading-none">⚡</span>
            </div>
            <span className="font-heading font-extrabold text-2xl uppercase tracking-tighter">ImageTool</span>
          </div>
          <p className="text-gray-400 font-medium max-w-sm">The unapologetic, brutalist image processing tool for modern creators and teams.</p>
        </div>
        <div>
          <h4 className="font-heading text-xl font-bold uppercase tracking-tighter mb-4 text-[#b7c6c2]">Product</h4>
          <ul className="flex flex-col gap-2 font-medium text-gray-400">
            <li><a href="#features" className="hover:text-white hover:underline decoration-2">Features</a></li>
            <li><a href="#" className="hover:text-white hover:underline decoration-2">Pricing</a></li>
            <li><a href="#" className="hover:text-white hover:underline decoration-2">Documentation</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-xl font-bold uppercase tracking-tighter mb-4 text-[#b7c6c2]">Legal</h4>
          <ul className="flex flex-col gap-2 font-medium text-gray-400">
            <li><a href="#" className="hover:text-white hover:underline decoration-2">Privacy</a></li>
            <li><a href="#" className="hover:text-white hover:underline decoration-2">Terms</a></li>
          </ul>
        </div>
      </div>
      
      <div className="py-6 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 font-medium text-sm">© 2026 ImageTool. All rights reserved.</p>
        <div className="flex gap-4">
          {[1, 2, 3].map((_, i) => (
            <a key={i} href="#" className="w-10 h-10 bg-[#272727] border-2 border-gray-600 hover:border-[#ffe17c] hover:bg-[#ffe17c] hover:text-black transition-colors flex items-center justify-center text-white">
              <span className="sr-only">Social Link</span>
              ✦
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
