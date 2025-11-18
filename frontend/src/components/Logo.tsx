import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true,
  className = '' 
}) => {
  const sizes = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-20'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/logo-jospia.png" 
        alt="JOSPIA Logo" 
        className={`${sizes[size]} w-auto object-contain`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold leading-tight">JOSPIA</span>
          <span className="text-xs opacity-80">2025-2026</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
