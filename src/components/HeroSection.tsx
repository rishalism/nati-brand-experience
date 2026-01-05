import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ArrowDown } from 'lucide-react';
import heroProduct from '@/assets/hero-product.jpg';

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll('.fade-up');
      elements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 50px,
            hsl(var(--primary)) 50px,
            hsl(var(--primary)) 51px
          )`
        }} />
      </div>

      <div className="container relative z-10 px-4 md:px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="fade-up space-y-6">
              {/* Tagline */}
              <p className="text-primary font-heading font-semibold text-sm md:text-base uppercase tracking-[0.3em]">
                Premium Electrolyte Mix
              </p>
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black uppercase leading-[0.9] tracking-tight">
                <span className="text-foreground">Rehydrate</span>
                <br />
                <span className="text-primary">Right</span>
              </h1>
              
              {/* Description */}
              <p className="text-foreground/60 text-base md:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                Expertly formulated with 6 essential electrolytes. 
                Designed for athletes, loved by everyone.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button variant="hero" size="xl">
                  Shop Now
                </Button>
                <Button variant="hero-outline" size="xl">
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-heading font-bold text-primary">6</p>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider">Electrolytes</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-heading font-bold text-primary">0</p>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider">Added Sugar</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-heading font-bold text-primary">100%</p>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider">Natural</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div className="fade-up order-1 lg:order-2 flex justify-center">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full scale-75" />
              
              {/* Product image */}
              <img
                src={heroProduct}
                alt="NATI Electrolyte Powder Pouches"
                className="relative z-10 w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl animate-float"
                style={{ animationDuration: '4s' }}
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-pulse">
          <span className="text-xs text-foreground/40 uppercase tracking-wider">Scroll</span>
          <ArrowDown className="w-5 h-5 text-foreground/40" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
