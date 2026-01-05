import React, { useEffect, useRef } from 'react';
import productSachets from '@/assets/product-sachets.jpg';

const electrolytes = [
  {
    symbol: 'Na',
    name: 'Sodium',
    benefit: 'Regulates blood pressure and fluid balance',
  },
  {
    symbol: 'K',
    name: 'Potassium',
    benefit: 'Supports heart health and muscle function',
  },
  {
    symbol: 'Mg',
    name: 'Magnesium',
    benefit: 'Promotes relaxation and metabolic processes',
  },
  {
    symbol: 'Ca',
    name: 'Calcium',
    benefit: 'Essential for bones and nerve transmission',
  },
  {
    symbol: 'Zn',
    name: 'Zinc',
    benefit: 'Boosts immune function and wound healing',
  },
  {
    symbol: 'Cl',
    name: 'Chloride',
    benefit: 'Maintains fluid balance and digestion',
  },
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
      className="py-20 md:py-32 relative overflow-hidden"
    >
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div>
            {/* Section header */}
            <div className="fade-up mb-6">
              <span className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
                The Science
              </span>
            </div>
            <h2 className="fade-up text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground mb-6 leading-tight">
              6 Essential{' '}
              <span className="text-primary">Electrolytes</span>
            </h2>
            <p className="fade-up text-foreground/60 text-base md:text-lg mb-10 leading-relaxed">
              Electrolytes are essential minerals that carry an electric charge and play 
              crucial roles in your body. Each one contributes uniquely to your health and performance.
            </p>

            {/* Electrolytes grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {electrolytes.map((item, index) => (
                <div
                  key={item.symbol}
                  className="fade-up group cursor-default"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="p-4 rounded-xl border border-border/50 hover:border-primary/30 bg-card/30 hover:bg-card/50 transition-all duration-300">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-heading font-bold text-primary">
                        {item.symbol}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/50 leading-relaxed">
                      {item.benefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="fade-up relative">
            {/* Glow effect */}
            <div className="absolute inset-0 blur-3xl bg-primary/10 rounded-full scale-90" />
            
            {/* Product image */}
            <img
              src={productSachets}
              alt="NATI Electrolyte Products"
              className="relative z-10 w-full rounded-2xl"
            />
          </div>
        </div>

        {/* Hydration fact */}
        <div className="fade-up mt-20 max-w-3xl mx-auto text-center">
          <div className="p-8 rounded-2xl bg-card/50 border border-border/50">
            <p className="text-foreground/80 text-lg md:text-xl font-medium mb-4">
              Did you know?
            </p>
            <p className="text-foreground/60 text-base leading-relaxed">
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
