import React from 'react';
import Logo from './Logo';
import './Loader.css';

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false }) => {
  return (
    <div className={`app-loader-wrapper ${fullScreen ? 'full-screen' : ''}`}>
      <div className="app-loader-brand">
        <Logo variant="header-light" size="lg" />
      </div>
      <div className="app-spinner"></div>
    </div>
  );
};

export default Loader;
