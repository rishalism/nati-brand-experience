import React, { useEffect, useRef } from 'react';
import { Beaker, Zap, Package, Citrus } from 'lucide-react';

const benefits = [
  {
    icon: Beaker,
    title: 'Scientifically Formulated',
    description: 'Tailored specifically for athletes and active lifestyles with optimal electrolyte ratios.',
  },
  {
    icon: Zap,
    title: 'Optimal Carbohydrates',
    description: 'Perfect balance for hydration without unnecessary calories or sugar spikes.',
  },
  {
    icon: Package,
    title: 'Convenient Packaging',
    description: 'Easy-to-use stick packs designed for on-the-go hydration anytime, anywhere.',
  },
  {
    icon: Citrus,
    title: 'Refreshing Citrus Flavor',
    description: 'A delicious, natural citrus taste that makes staying hydrated enjoyable.',
  },
];

const BenefitsSection: React.FC = () => {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll('.fade-up');
      elements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="benefits" 
      ref={sectionRef}
      className="py-20 md:py-32 bg-card/30 relative"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="fade-up mb-6">
            <span className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
              Why Choose NATI
            </span>
          </div>
          <h2 className="fade-up text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground leading-tight">
            Hydration that{' '}
            <span className="text-primary">performs</span>
          </h2>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="fade-up group"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="h-full p-6 md:p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom highlight */}
        <div className="fade-up mt-16 text-center">
          <p className="text-foreground/50 text-sm max-w-xl mx-auto">
            We prioritize Recommended Dietary Allowances (RDA) in our formulations, 
            ensuring products that cater to diverse hydration needs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
