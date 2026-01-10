import { Header, Footer } from "@/components/layout";
import { HeroSection, CategoriesSection } from "@/components/home";

export default function HomePageContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
}
