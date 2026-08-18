import React from 'react';
import './Logo.css';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface LogoProps {
  variant?: 'dark' | 'light' | 'header-light';
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
}) => {
  const { brandLogoHeader, brandLogoFooter, brandName } = useSiteSettings();

  // header-light → header logo (dynamic or default)
  // light/dark    → footer/wordmark logo (dynamic or default)
  const src = variant === 'header-light' ? brandLogoHeader : brandLogoFooter;

  return (
    <a href="/" className={`logo logo--${variant} logo--${size}`} aria-label={`${brandName} Home`} style={{ textDecoration: 'none' }}>
      {src ? (
        <img
          src={src}
          alt={brandName}
          className="logo-img"
          width={variant === 'header-light' ? 140 : undefined}
          height={variant === 'header-light' ? 48 : undefined}
        />
      ) : (
        <span style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', fontWeight: 700, color: variant === 'header-light' ? '#fff' : 'inherit' }}>
          {brandName}
        </span>
      )}
    </a>
  );
};

export default Logo;
