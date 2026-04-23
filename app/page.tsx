import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Personas from "@/components/landing/Personas";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="bg-[#ffe17c] text-black min-h-screen font-sans selection:bg-black selection:text-white">
      <Navigation />
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <Personas />
      <Testimonials />
      <Footer />
    </div>
  );
}
