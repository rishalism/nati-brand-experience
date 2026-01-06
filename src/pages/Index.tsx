import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import BenefitsSection from '@/components/BenefitsSection';
import ElectrolytesSection from '@/components/ElectrolytesSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <AboutSection />
      <BenefitsSection />
      <ElectrolytesSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
