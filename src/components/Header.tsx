import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import NatiLogo from './NatiLogo';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isShopPage = location.pathname === '/shop';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Science', href: '#science' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/30 py-3' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <NatiLogo size="lg" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-medium tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Button / Cart / Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isShopPage && onCartClick ? (
              <button
                onClick={onCartClick}
                className="relative p-2.5 text-foreground hover:text-primary transition-colors rounded-xl hover:bg-primary/10"
              >
                <ShoppingBag size={22} />
                {cartCount !== undefined && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-heading font-semibold">
                    {cartCount}
                  </span>
                )}
              </button>
            ) : (
              <Link to="/login">
                <Button variant="hero" size="default">
                  Shop Now
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button + Theme Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground rounded-xl hover:bg-primary/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
            isMobileMenuOpen ? 'max-h-[400px] opacity-100 pt-6 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-medium tracking-wide py-3 px-4 rounded-xl hover:bg-primary/5"
              >
                {link.label}
              </a>
            ))}
            {isShopPage && onCartClick ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onCartClick();
                }}
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors py-3 px-4 rounded-xl hover:bg-primary/5"
              >
                <ShoppingBag size={20} />
                <span className="font-medium">Cart {cartCount !== undefined && cartCount > 0 && `(${cartCount})`}</span>
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-2">
                <Button variant="hero" size="lg" className="w-full">
                  Shop Now
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
