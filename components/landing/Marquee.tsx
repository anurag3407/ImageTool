export default function Marquee() {
  return (
    <section className="bg-[#171e19] border-y-2 border-black py-6 overflow-hidden flex items-center relative">
      <div className="animate-marquee-slow text-[#b7c6c2]/50 font-heading text-4xl lg:text-5xl font-black uppercase tracking-widest whitespace-nowrap">
        <span className="mx-8">ACME CORP</span>
        <span className="mx-8">GLOBEX</span>
        <span className="mx-8">SOYLENT</span>
        <span className="mx-8">INITECH</span>
        <span className="mx-8">UMBRELLA</span>
        <span className="mx-8">STARK IND</span>
        <span className="mx-8">ACME CORP</span>
        <span className="mx-8">GLOBEX</span>
        <span className="mx-8">SOYLENT</span>
        <span className="mx-8">INITECH</span>
        <span className="mx-8">UMBRELLA</span>
        <span className="mx-8">STARK IND</span>
      </div>
    </section>
  );
}
