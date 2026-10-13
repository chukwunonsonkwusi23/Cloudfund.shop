import { AboutSection } from "../../../components/home/AboutSection";
import BlogSection from "../../../components/home/BlogSection";
import { ContactSection } from "../../../components/home/Contact";
import HeroSection from "../../../components/home/HeroSection";
import Menu from "../../../components/home/Menu";
import MainLayouts from "../../../layouts/MainLayouts";

export default function FoodSitePage() {
  return (
    <MainLayouts>
      <HeroSection />
      <Menu />
      <AboutSection />
      <BlogSection />
      <ContactSection />
    </MainLayouts>
  );
}
