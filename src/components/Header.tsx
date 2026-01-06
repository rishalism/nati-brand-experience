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
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md border-b border-border/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex-shrink-0">
            <NatiLogo size="lg" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm font-medium uppercase tracking-wider"
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
                className="relative p-2 text-foreground hover:text-primary transition-colors"
              >
                <ShoppingBag size={24} />
                {cartCount !== undefined && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-heading">
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
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden bg-background/50 backdrop-blur-md border-b border-border/50 overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-96 pb-6' : 'max-h-0'
          }`}
        >
          <nav className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm font-medium uppercase tracking-wider py-2"
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
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
              >
                <ShoppingBag size={20} />
                Cart {cartCount !== undefined && cartCount > 0 && `(${cartCount})`}
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="hero" size="lg" className="mt-4 w-full">
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
