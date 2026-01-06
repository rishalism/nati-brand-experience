import React from 'react';
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
        answer: 'Electrolytes are essential minerals like sodium, potassium, magnesium, calcium, zinc, and chloride that carry an electric charge. They regulate nerve and muscle function, hydrate your body, balance blood pressure, and help rebuild damaged tissue. When you sweat, exercise, or are ill, you lose electrolytes and need to replenish them.',
      },
      {
        question: 'How do I use NATI electrolyte sachets?',
        answer: 'Simply tear open a sachet and mix with 16-20 oz (500-600ml) of cold water. Stir or shake until fully dissolved. For best results, consume during or after physical activity, in hot weather, or anytime you need hydration support.',
      },
      {
        question: 'Is NATI suitable for everyday use?',
        answer: 'Absolutely! NATI is designed for daily hydration support. Whether you\'re an athlete, working in an office, or simply want to maintain optimal hydration, NATI provides the electrolytes your body needs without sugar or artificial ingredients.',
      },
      {
        question: 'Does NATI contain any sugar or artificial sweeteners?',
        answer: 'NATI is completely sugar-free and contains no artificial sweeteners, colors, or preservatives. We use only clean, lab-tested ingredients to provide pure electrolyte replenishment.',
      },
    ],
  },
  {
    category: 'Shipping & Orders',
    questions: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 3-5 business days within the continental US. Express shipping (1-2 business days) is available at checkout. International shipping times vary by destination, usually 7-14 business days.',
      },
      {
        question: 'Do you offer free shipping?',
        answer: 'Yes! We offer free standard shipping on all orders over $50. Subscribers to our Monthly plan always receive free shipping regardless of order size.',
      },
      {
        question: 'Can I modify or cancel my subscription?',
        answer: 'Absolutely. You can pause, skip, modify, or cancel your subscription at any time through your account dashboard. Changes made before your next billing date will take effect immediately.',
      },
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day satisfaction guarantee. If you\'re not completely satisfied with NATI, return any unused sachets for a full refund. No questions asked.',
      },
    ],
  },
  {
    category: 'Health & Safety',
    questions: [
      {
        question: 'Is NATI safe for people with dietary restrictions?',
        answer: 'NATI is gluten-free, dairy-free, soy-free, and vegan-friendly. However, if you have specific health conditions or are taking medications, we recommend consulting with your healthcare provider before use.',
      },
      {
        question: 'Can I take NATI while pregnant or nursing?',
        answer: 'While NATI contains only essential minerals, we recommend consulting with your healthcare provider before using any supplements during pregnancy or while nursing.',
      },
      {
        question: 'How much NATI can I consume per day?',
        answer: 'For most adults, 1-3 sachets per day is optimal depending on your activity level and hydration needs. Athletes or those in hot climates may benefit from higher intake. Listen to your body and adjust accordingly.',
      },
    ],
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 md:py-32 bg-background">
      <div className="container max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wider mb-4">
            FREQUENTLY <span className="text-primary">ASKED</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Got questions? We've got answers. Find everything you need to know about NATI.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqs.map((category, idx) => (
            <div key={idx}>
              <h3 className="font-heading text-xl text-primary tracking-wider mb-6 uppercase">
                {category.category}
              </h3>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, faqIdx) => (
                  <AccordionItem
                    key={faqIdx}
                    value={`${idx}-${faqIdx}`}
                    className="bg-card border border-border rounded-lg px-6 data-[state=open]:border-primary/50 transition-colors"
                  >
                    <AccordionTrigger className="font-heading text-lg text-foreground tracking-wide hover:text-primary hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground font-body leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground font-body mb-4">
            Still have questions?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-heading text-lg tracking-wider transition-colors"
          >
            CONTACT US →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
