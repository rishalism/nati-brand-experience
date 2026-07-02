import React from 'react';
import natilogo from '../assets/Logo.png'

interface NatiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const NatiLogo: React.FC<NatiLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16',
  };

  return (
    <div className={`flex items-center  ${className}`}>
      {/* Logo image (replaces the SVG) */}
      <img
        src={natilogo}
        alt="nati"
        className={`${sizeClasses[size]}  object-contain`}
      />
    </div>
  );
};

export default NatiLogo;
