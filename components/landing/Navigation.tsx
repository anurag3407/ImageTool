import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-[#ffe17c] border-b-2 border-black z-50 flex items-center justify-between px-6 lg:px-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black">
          <span className="text-[#ffe17c] font-black text-2xl leading-none">⚡</span>
        </div>
        <span className="font-heading font-extrabold text-2xl uppercase tracking-tighter">ImageTool</span>
      </div>
      <div className="hidden md:flex items-center gap-8 font-bold uppercase tracking-widest text-sm">
        <a href="#features" className="hover:underline decoration-2">Features</a>
        <a href="#how-it-works" className="hover:underline decoration-2">How It Works</a>
      </div>
      <div>
        <Link href="/dashboard" className="btn-neo text-sm py-2 px-4 uppercase">
          Open Dashboard
        </Link>
      </div>
    </nav>
  );
}
