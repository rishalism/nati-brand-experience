import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Package, Heart, LogOut, LogIn } from 'lucide-react';
import NatiLogo from './NatiLogo';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuthStore } from '@/features/auth/auth.store';
import { authApi } from '@/features/auth/auth.api';

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthed = useAuthStore((s) => s.status === 'authenticated');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Anchor links are rooted so they work from any page, not just the landing page.
  const navLinks = [
    { label: 'About', href: '/#about' },
    { label: 'Benefits', href: '/#benefits' },
    { label: 'Science', href: '/#science' },
    { label: 'FAQ', href: '/#faq' },
  ];

  const accountLinks = [
    { label: 'Profile', to: '/profile', icon: User },
    { label: 'Orders', to: '/orders', icon: Package },
    { label: 'Wishlist', to: '/wishlist', icon: Heart },
  ];

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await authApi.logout();
    navigate('/');
  };

  const cartButton = onCartClick && (
    <button
      onClick={() => {
        setIsMobileMenuOpen(false);
        onCartClick();
      }}
      className="relative p-2.5 text-foreground hover:text-primary transition-colors rounded-xl hover:bg-primary/10"
      aria-label="Open cart"
    >
      <ShoppingBag size={22} />
      {cartCount !== undefined && cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-heading font-semibold">
          {cartCount}
        </span>
      )}
    </button>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/30 py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
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

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {cartButton}
            {isAuthed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2.5 text-foreground hover:text-primary transition-colors rounded-xl hover:bg-primary/10"
                    aria-label="Account menu"
                  >
                    <User size={22} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-body">
                    Hi, {user?.firstName ?? 'there'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accountLinks.map(({ label, to, icon: Icon }) => (
                    <DropdownMenuItem key={to} asChild>
                      <Link to={to} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="h-4 w-4" /> {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium tracking-wide px-2"
              >
                Sign In
              </Link>
            )}
            <Link to="/shop">
              <Button variant="hero" size="default">
                Shop Now
              </Button>
            </Link>
          </div>

          {/* Mobile: theme + cart + menu button */}
          <div className="flex md:hidden items-center gap-1.5">
            <ThemeToggle />
            {cartButton}
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
            isMobileMenuOpen ? 'max-h-[600px] opacity-100 pt-6 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-1">
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

            {isAuthed ? (
              <>
                <div className="border-t border-border/50 my-2" />
                {accountLinks.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors py-3 px-4 rounded-xl hover:bg-primary/5"
                  >
                    <Icon size={20} />
                    <span className="font-medium text-sm">{label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-destructive hover:text-destructive/80 transition-colors py-3 px-4 rounded-xl hover:bg-destructive/5 text-left"
                >
                  <LogOut size={20} />
                  <span className="font-medium text-sm">Sign out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors py-3 px-4 rounded-xl hover:bg-primary/5"
              >
                <LogIn size={20} />
                <span className="font-medium text-sm">Sign In</span>
              </Link>
            )}

            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="mt-2">
              <Button variant="hero" size="lg" className="w-full">
                Shop Now
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
