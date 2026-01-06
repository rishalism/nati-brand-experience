import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    category: 'Product',
    questions: [
      {
        question: 'What are electrolytes and why do I need them?',
        answer: 'Electrolytes are essential minerals like sodium, potassium, magnesium, calcium, zinc, and chloride that carry an electric charge. They regulate nerve and muscle function, hydrate your body, balance blood pressure, and help rebuild damaged tissue.',
      },
      {
        question: 'How do I use NATI electrolyte sachets?',
        answer: 'Simply tear open a sachet and mix with 16-20 oz (500-600ml) of cold water. Stir or shake until fully dissolved. For best results, consume during or after physical activity.',
      },
      {
        question: 'Is NATI suitable for everyday use?',
        answer: "Absolutely! NATI is designed for daily hydration support. Whether you're an athlete or simply want to maintain optimal hydration, NATI provides the electrolytes your body needs.",
      },
      {
        question: 'Does NATI contain any sugar or artificial sweeteners?',
        answer: 'NATI is completely sugar-free and contains no artificial sweeteners, colors, or preservatives. We use only clean, lab-tested ingredients.',
      },
    ],
  },
  {
    category: 'Shipping & Orders',
    questions: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 3-5 business days within the continental US. Express shipping (1-2 business days) is available at checkout.',
      },
      {
        question: 'Do you offer free shipping?',
        answer: 'Yes! We offer free standard shipping on all orders over $50. Subscribers to our Monthly plan always receive free shipping.',
      },
      {
        question: 'Can I modify or cancel my subscription?',
        answer: 'Absolutely. You can pause, skip, modify, or cancel your subscription at any time through your account dashboard.',
      },
    ],
  },
  {
    category: 'Health & Safety',
    questions: [
      {
        question: 'Is NATI safe for people with dietary restrictions?',
        answer: 'NATI is gluten-free, dairy-free, soy-free, and vegan-friendly. However, if you have specific health conditions, we recommend consulting with your healthcare provider.',
      },
      {
        question: 'How much NATI can I consume per day?',
        answer: 'For most adults, 1-3 sachets per day is optimal depending on your activity level. Athletes or those in hot climates may benefit from higher intake.',
      },
    ],
  },
];

const FAQSection = () => {
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
    <section id="faq" ref={sectionRef} className="section-padding bg-card/20">
      <div className="container max-w-4xl px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="fade-up premium-label">Support</p>
          <h2 className="fade-up text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground leading-[1.1]">
            Frequently <span className="text-gradient-lime">Asked</span>
          </h2>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-16">
          {faqs.map((category, idx) => (
            <div key={idx} className="fade-up" style={{ transitionDelay: `${idx * 100}ms` }}>
              <h3 className="font-heading text-sm text-primary tracking-[0.2em] mb-8 uppercase font-medium">
                {category.category}
              </h3>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, faqIdx) => (
                  <AccordionItem
                    key={faqIdx}
                    value={`${idx}-${faqIdx}`}
                    className="glass-card px-6 data-[state=open]:border-primary/40 transition-all duration-300"
                  >
                    <AccordionTrigger className="font-heading text-base md:text-lg text-foreground tracking-wide hover:text-primary hover:no-underline py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="fade-up mt-20 text-center" style={{ transitionDelay: '300ms' }}>
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-heading text-base tracking-wider transition-colors group"
          >
            Contact Us
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
