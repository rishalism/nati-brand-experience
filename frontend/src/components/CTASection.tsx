import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '1000+', label: 'Happy Customers' },
  { value: '4.9★', label: 'Average Rating' },
  { value: 'Lab', label: 'Tested Quality' },
  { value: 'Fast', label: 'Shipping' },
];

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
      className="section-padding relative overflow-hidden"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
      
      {/* Decorative blurs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="container relative z-10 px-6 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main content */}
          <p className="fade-up premium-label">Start Your Journey</p>
          
          <h2 className="fade-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-8 leading-[1.05]">
            Ready to{' '}
            <span className="text-gradient-lime">Rehydrate Right</span>?
          </h2>
          
          <p className="fade-up text-muted-foreground text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed font-light" style={{ transitionDelay: '100ms' }}>
            Join thousands who trust NATI for their hydration needs. 
            Experience the difference quality electrolytes make.
          </p>

          {/* CTA Buttons */}
          <div className="fade-up flex flex-col sm:flex-row gap-4 justify-center" style={{ transitionDelay: '150ms' }}>
            <Link to="/login">
              <Button variant="hero" size="xl" className="group btn-glow">
                Shop Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Button variant="hero-outline" size="xl">
              Contact Us
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="fade-up mt-20 grid grid-cols-2 md:grid-cols-4 gap-8" style={{ transitionDelay: '200ms' }}>
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
