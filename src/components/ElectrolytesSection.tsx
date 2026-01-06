import React, { useEffect, useRef } from 'react';
import productSachets from '@/assets/product-sachets.jpg';

const electrolytes = [
  { symbol: 'Na', name: 'Sodium', benefit: 'Regulates blood pressure and fluid balance' },
  { symbol: 'K', name: 'Potassium', benefit: 'Supports heart health and muscle function' },
  { symbol: 'Mg', name: 'Magnesium', benefit: 'Promotes relaxation and metabolic processes' },
  { symbol: 'Ca', name: 'Calcium', benefit: 'Essential for bones and nerve transmission' },
  { symbol: 'Zn', name: 'Zinc', benefit: 'Boosts immune function and wound healing' },
  { symbol: 'Cl', name: 'Chloride', benefit: 'Maintains fluid balance and digestion' },
];

const ElectrolytesSection: React.FC = () => {
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
      id="science" 
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      <div className="container px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left content */}
          <div>
            <p className="fade-up premium-label">The Science</p>
            <h2 className="fade-up text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground mb-8 leading-[1.1]">
              6 Essential{' '}
              <span className="text-gradient-lime">Electrolytes</span>
            </h2>
            <p className="fade-up text-muted-foreground text-lg md:text-xl mb-12 leading-relaxed font-light" style={{ transitionDelay: '100ms' }}>
              Electrolytes are essential minerals that carry an electric charge and play 
              crucial roles in your body. Each one contributes uniquely to your health and performance.
            </p>

            {/* Electrolytes grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {electrolytes.map((item, index) => (
                <div
                  key={item.symbol}
                  className="fade-up group"
                  style={{ transitionDelay: `${150 + index * 50}ms` }}
                >
                  <div className="glass-card-hover p-5">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-display font-bold text-primary">
                        {item.symbol}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.benefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="fade-up relative" style={{ transitionDelay: '200ms' }}>
            {/* Ambient glow */}
            <div className="absolute inset-0 blur-[60px] bg-primary/15 rounded-full scale-90" />
            
            {/* Product image */}
            <img
              src={productSachets}
              alt="NATI Electrolyte Products"
              className="relative z-10 w-full rounded-3xl"
            />
          </div>
        </div>

        {/* Hydration fact */}
        <div className="fade-up mt-24 max-w-3xl mx-auto" style={{ transitionDelay: '300ms' }}>
          <div className="glass-card p-10 text-center">
            <p className="text-foreground text-xl md:text-2xl font-display font-medium mb-4">
              Did you know?
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              <span className="text-primary font-semibold">75%</span> of people worldwide 
              experience dehydration, leading to fatigue, headaches, and poor concentration. 
              Proper electrolyte balance is key to staying hydrated and healthy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElectrolytesSection;
