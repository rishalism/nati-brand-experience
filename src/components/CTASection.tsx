import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll('.fade-up');
      elements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 md:py-32 relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main content */}
          <div className="fade-up">
            <span className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-6 block">
              Start Your Journey
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-foreground mb-6 leading-tight">
              Ready to{' '}
              <span className="text-primary">Rehydrate Right</span>?
            </h2>
            <p className="text-foreground/60 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands who trust NATI for their hydration needs. 
              Experience the difference quality electrolytes make in your performance and daily life.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" className="group">
                Shop Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="hero-outline" size="xl">
                Contact Us
              </Button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="fade-up mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-heading font-bold text-primary mb-1">1000+</p>
              <p className="text-xs text-foreground/50 uppercase tracking-wider">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-heading font-bold text-primary mb-1">4.9★</p>
              <p className="text-xs text-foreground/50 uppercase tracking-wider">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-heading font-bold text-primary mb-1">Lab</p>
              <p className="text-xs text-foreground/50 uppercase tracking-wider">Tested Quality</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-heading font-bold text-primary mb-1">Fast</p>
              <p className="text-xs text-foreground/50 uppercase tracking-wider">Shipping</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
