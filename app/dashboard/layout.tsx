import { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#171e19] min-h-screen text-white font-sans flex flex-col md:flex-row selection:bg-[#ffe17c] selection:text-black">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#ffe17c] border-b-2 md:border-b-0 md:border-r-2 border-black flex flex-col">
        <div className="p-6 border-b-2 border-black">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-black flex items-center justify-center border-2 border-black">
              <span className="text-[#ffe17c] font-black text-xl leading-none">⚡</span>
            </div>
            <span className="text-black font-heading font-extrabold text-xl uppercase tracking-tighter">ImageTool</span>
          </Link>
        </div>
        <div className="p-6 flex-1 text-black font-bold uppercase tracking-widest text-sm flex flex-col gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 hover:translate-x-1 transition-transform">
            <span className="w-2 h-2 bg-black rounded-full"></span> Dashboard
          </Link>
          <Link href="/dashboard/history" className="flex items-center gap-2 hover:translate-x-1 transition-transform">
            <span className="w-2 h-2 bg-black rounded-full"></span> History
          </Link>
          <a href="#" className="flex items-center gap-2 hover:translate-x-1 transition-transform text-black/50">
            <span className="w-2 h-2 bg-black/50 rounded-full"></span> Settings (Soon)
          </a>
          <a href="#" className="flex items-center gap-2 hover:translate-x-1 transition-transform text-black/50">
            <span className="w-2 h-2 bg-black/50 rounded-full"></span> API Keys (Soon)
          </a>
        </div>
        <div className="p-6 border-t-2 border-black text-xs font-bold text-black/50 uppercase tracking-widest">
          SYSTEM: ONLINE<br/>
          ENV: PRODUCTION
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12">
        {children}
      </main>
    </div>
  );
}
