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
      className="section-padding bg-card/30 relative"
    >
      {/* Section dividers */}
      <div className="section-divider absolute top-0 left-0" />
      <div className="section-divider absolute bottom-0 left-0" />

      <div className="container px-6 md:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="fade-up premium-label">Why Choose NATI</p>
          <h2 className="fade-up text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground leading-[1.1]">
            Hydration that{' '}
            <span className="text-gradient-lime">performs</span>
          </h2>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="fade-up"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="glass-card-hover h-full p-8">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom highlight */}
        <p className="fade-up mt-20 text-center text-muted-foreground text-sm max-w-xl mx-auto" style={{ transitionDelay: '400ms' }}>
          We prioritize Recommended Dietary Allowances (RDA) in our formulations, 
          ensuring products that cater to diverse hydration needs.
        </p>
      </div>
    </section>
  );
};

export default BenefitsSection;
