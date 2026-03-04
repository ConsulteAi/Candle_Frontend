import { HeroSection, CategoriesSection } from "@/components/home";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function HomePageContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
}

