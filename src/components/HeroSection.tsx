import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import heroProduct from '@/assets/product-sachets-hero.jpg';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        // Only update when hero is visible
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Parallax transform value - image moves slower than scroll
  const parallaxOffset = scrollY * 0.4;

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Full-screen background image with parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-[120%] -top-[10%] transition-transform duration-100 ease-out will-change-transform"
          style={{ 
            transform: `translateY(${parallaxOffset}px) scale(1.1)`,
          }}
        >
          <img
            src={heroProduct}
            alt="NATI Electrolyte Products"
            className="w-full h-full object-cover object-center"
          />
        </div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      {/* Content overlay */}
      <div className="container relative z-10 px-6 md:px-8 py-24 md:py-32 lg:py-40">
        <div className="max-w-2xl">
          <div className="fade-up space-y-6 md:space-y-8">
            {/* Tagline */}
            <p className="premium-label animate-fade-in">
              Premium Electrolyte Mix
            </p>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold leading-[0.95] tracking-tight">
              <span className="text-foreground block">Rehydrate</span>
              <span className="text-gradient-lime italic font-serif">Right</span>
            </h1>
            
            {/* Description */}
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-md leading-relaxed font-light">
              Expertly formulated with 6 essential electrolytes. 
              Designed for athletes, loved by everyone.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="hero" size="xl" className="group btn-glow w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-start gap-6 sm:gap-10 pt-6 md:pt-10">
              {[
                { value: '6', label: 'Electrolytes' },
                { value: '0', label: 'Added Sugar' },
                { value: '100%', label: 'Natural' },
              ].map((stat, i) => (
                <React.Fragment key={stat.label}>
                  {i > 0 && <div className="w-px h-12 sm:h-14 bg-border/50" />}
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                      {stat.value}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">
                      {stat.label}
                    </p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator with subtle animation */}
      <div 
        className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 z-10"
        style={{ 
          opacity: Math.max(0, 1 - scrollY / 300),
          transform: `translateX(-50%) translateY(${scrollY * 0.2}px)` 
        }}
      >
        <span className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">Discover</span>
        <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/50 to-transparent animate-pulse" />
      </div>
    </section>
  );
};

export default HeroSection;
