import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ArrowDown, ArrowRight } from 'lucide-react';
import heroProduct from '@/assets/hero-product.jpg';
import { Link } from 'react-router-dom';

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="container relative z-10 px-6 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="fade-up space-y-8">
              {/* Tagline */}
              <p className="premium-label">
                Premium Electrolyte Mix
              </p>
              
              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.95] tracking-tight">
                <span className="text-foreground">Rehydrate</span>
                <br />
                <span className="text-gradient-lime">Right</span>
              </h1>
              
              {/* Description */}
              <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                Expertly formulated with 6 essential electrolytes. 
                Designed for athletes, loved by everyone.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link to="/login">
                  <Button variant="hero" size="xl" className="group btn-glow">
                    Shop Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Button variant="hero-outline" size="xl">
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-10 pt-10">
                {[
                  { value: '6', label: 'Electrolytes' },
                  { value: '0', label: 'Added Sugar' },
                  { value: '100%', label: 'Natural' },
                ].map((stat, i) => (
                  <React.Fragment key={stat.label}>
                    {i > 0 && <div className="w-px h-14 bg-border/50" />}
                    <div className="text-center">
                      <p className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        {stat.label}
                      </p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div className="fade-up order-1 lg:order-2 flex justify-center" style={{ transitionDelay: '200ms' }}>
            <div className="relative">
              {/* Ambient glow */}
              <div className="absolute inset-0 blur-[80px] bg-primary/20 rounded-full scale-90 animate-glow-pulse" />
              
              {/* Product image */}
              <img
                src={heroProduct}
                alt="NATI Electrolyte Powder Pouches"
                className="relative z-10 w-full max-w-sm md:max-w-md lg:max-w-lg rounded-3xl animate-float-slow"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">Discover</span>
          <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
