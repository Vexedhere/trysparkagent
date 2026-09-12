import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BrowserMockup } from "@/components/BrowserMockup";
import { Features } from "@/components/Features";
import { AuthCard } from "@/components/AuthCard";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <div className="bg-grid-canvas" />
      <div className="animate-glow-move pointer-events-none fixed left-1/2 top-[-10%] z-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-spark-gradient-soft blur-[110px]" aria-hidden="true" />
      <div className="relative z-10">
        <Header />
        <main><Hero /><BrowserMockup /><Features /><AuthCard /></main>
        <Footer />
      </div>
    </>
  );
}
