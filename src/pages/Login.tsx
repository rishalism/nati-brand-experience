import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NatiLogo from '@/components/NatiLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check password
    setTimeout(() => {
      if (password === 'kunjappu') {
        // Store auth in sessionStorage
        sessionStorage.setItem('nati-auth', 'true');
        navigate('/shop');
      } else {
        toast({
          title: 'Invalid Password',
          description: 'Please enter the correct password to access the shop.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-16 animate-fade-in">
        <NatiLogo className="h-28 md:h-36" />
      </div>

      {/* Login Form */}
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md space-y-6 animate-fade-in"
        style={{ animationDelay: '200ms' }}
      >
        <div className="flex gap-0">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 h-14 bg-transparent border-0 border-b border-foreground/30 rounded-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary font-body text-base tracking-wider"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="h-14 px-8 bg-primary text-primary-foreground font-heading text-lg tracking-wider rounded-none hover:bg-primary/90 transition-all"
          >
            {isLoading ? '...' : 'ENTER'}
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-14 bg-primary text-primary-foreground font-heading text-sm tracking-widest rounded-none border-0 hover:bg-primary/90 relative overflow-hidden"
          onClick={() => toast({
            title: 'Waitlist',
            description: 'Waitlist feature coming soon!',
          })}
        >
          <span className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
          JOIN WAITLIST FOR PASSWORD
        </Button>

        <p className="text-center text-muted-foreground text-xs tracking-wider italic">
          **DROPS ARE ONLY ACCESSIBLE WITH PASSWORD**
        </p>
      </form>
    </main>
  );
};

export default Login;
