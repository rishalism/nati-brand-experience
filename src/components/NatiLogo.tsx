import React from 'react';

interface NatiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const NatiLogo: React.FC<NatiLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon - Triangular pattern */}
      <svg 
        viewBox="0 0 60 50" 
        className={`${sizeClasses[size]} w-auto`}
        fill="none"
      >
        {/* Main lime triangles */}
        <polygon points="0,25 15,0 30,25" className="fill-primary" />
        <polygon points="15,25 30,0 45,25" className="fill-primary" />
        <polygon points="30,25 45,0 60,25" className="fill-primary" />
        {/* Dark cut-out triangle */}
        <polygon points="22.5,12.5 30,25 37.5,12.5" className="fill-background" />
        {/* Bottom triangles */}
        <polygon points="15,25 30,50 45,25" className="fill-primary" />
      </svg>
      
      {/* Text */}
      <span className="font-heading font-black text-primary tracking-tight italic" style={{ 
        fontSize: size === 'sm' ? '1.5rem' : size === 'md' ? '1.875rem' : '2.5rem'
      }}>
        nati
      </span>
    </div>
  );
};

export default NatiLogo;
