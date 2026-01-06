import React from 'react';
import NatiLogo from './NatiLogo';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Shop', href: '#' },
    { label: 'Flavors', href: '#' },
    { label: 'Subscriptions', href: '#' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Science', href: '#science' },
    { label: 'Contact', href: '#contact' },
  ],
  support: [
    { label: 'FAQ', href: '#faq' },
    { label: 'Shipping', href: '#' },
    { label: 'Returns', href: '#' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Mail, href: '#', label: 'Email' },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-card/40 border-t border-border/30">
      <div className="container px-6 md:px-8 py-20 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <NatiLogo size="lg" className="mb-8" />
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs">
              Premium electrolyte hydration, crafted for performance and loved by everyone.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-11 h-11 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-5 text-xs uppercase tracking-[0.15em]">
              Product
            </h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-5 text-xs uppercase tracking-[0.15em]">
              Company
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-5 text-xs uppercase tracking-[0.15em]">
              Support
            </h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-border/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground/60 text-xs">
              © {currentYear} NATI. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-muted-foreground/60 hover:text-muted-foreground text-xs transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground/60 hover:text-muted-foreground text-xs transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
