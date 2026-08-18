import React from 'react';
import './Loader.css';

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false }) => {
  return (
    <div className={`app-loader-wrapper ${fullScreen ? 'full-screen' : ''}`}>
      <div className="app-loader-brand">srishtique</div>
      <div className="app-spinner"></div>
    </div>
  );
};

export default Loader;
