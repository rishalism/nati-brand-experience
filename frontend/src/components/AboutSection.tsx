import React, { useEffect, useRef } from 'react';
import { CheckCircle, FlaskConical, Users } from 'lucide-react';

const values = [
  {
    icon: CheckCircle,
    title: 'Quality First',
    description: 'Rigorous testing and premium ingredients in every sachet',
  },
  {
    icon: FlaskConical,
    title: 'Science-Backed',
    description: 'Formulated based on RDA guidelines and research',
  },
  {
    icon: Users,
    title: 'For Everyone',
    description: 'Suitable for all ages from children to seniors',
  },
];

const AboutSection: React.FC = () => {
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
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll('.fade-up');
      elements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />

      <div className="container px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section label */}
          <p className="fade-up premium-label">Our Story</p>

          {/* Main heading */}
          <h2 className="fade-up text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground mb-10 leading-[1.1]">
            Born from a passion for{' '}
            <span className="text-gradient-lime">optimal hydration</span>
          </h2>

          {/* Story text */}
          <div className="fade-up space-y-6 text-muted-foreground text-lg md:text-xl leading-relaxed font-light max-w-3xl mx-auto">
            <p>
              Journey started in 2022, NATI emerged from a vision to create the finest electrolytes 
              in India and across the world. Using cutting-edge scientific methods and premium resources, 
              we set out to develop a hydration solution that truly delivers.
            </p>
            <p>
              Our commitment is simple: effective, easy-to-use products with minimal preservatives 
              and additives. We believe everyone deserves premium hydration without the premium price tag.
            </p>
          </div>

          {/* Values grid */}
          <div className="fade-up grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20" style={{ transitionDelay: '200ms' }}>
            {values.map((item, index) => (
              <div 
                key={item.title}
                className="glass-card-hover p-8 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
