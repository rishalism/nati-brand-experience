import React, { useEffect, useRef } from 'react';

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
      id="about" 
      ref={sectionRef}
      className="py-20 md:py-32 relative overflow-hidden"
    >
      {/* Subtle accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-primary to-transparent" />

      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section label */}
          <div className="fade-up mb-6">
            <span className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
              Our Story
            </span>
          </div>

          {/* Main heading */}
          <h2 className="fade-up text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground mb-8 leading-tight">
            BORN FROM A PASSION FOR{' '}
            <span className="text-primary">OPTIMAL HYDRATION</span>
          </h2>

          {/* Story text */}
          <div className="fade-up space-y-6 text-foreground/70 text-base md:text-lg leading-relaxed">
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
          <div className="fade-up grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            <div className="group p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Quality First</h3>
              <p className="text-sm text-foreground/60">Rigorous testing and premium ingredients in every sachet</p>
            </div>

            <div className="group p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Science-Backed</h3>
              <p className="text-sm text-foreground/60">Formulated based on RDA guidelines and research</p>
            </div>

            <div className="group p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">For Everyone</h3>
              <p className="text-sm text-foreground/60">Suitable for all ages from children to seniors</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
