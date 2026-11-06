import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 36, showText = false }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`rounded-xl shadow-xs overflow-hidden ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#006194" />
            <stop offset="100%" stopColor="#003554" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill="url(#logoBgGrad)" />
        {/* Scratch Cat Ears Badge */}
        <polygon points="28,34 38,18 46,36" fill="#FFAB19" />
        <polygon points="72,34 62,18 54,36" fill="#FFAB19" />
        {/* Astronaut Helmet / Face */}
        <circle cx="50" cy="52" r="28" fill="#FFFFFF" />
        <circle cx="50" cy="52" r="22" fill="#001F3F" />
        <ellipse cx="50" cy="50" rx="16" ry="12" fill="#007BB9" opacity="0.8" />
        {/* Glow Spark */}
        <polygon points="50,42 53,49 60,50 54,54 56,61 50,56 44,61 46,54 40,50 47,49" fill="#FFD500" />
      </svg>
    );
  }

  return (
    <img
      src="/assets/logo.png"
      alt="Ardena Playground Logo"
      width={size}
      height={size}
      onError={() => setImageError(true)}
      className={`object-contain rounded-xl shadow-xs ${className}`}
    />
  );
};

