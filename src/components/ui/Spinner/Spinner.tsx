import React from 'react';
import './Spinner.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  label = 'Loading...',
}) => {
  return (
    <div
      role="status"
      aria-label={label}
      className={`ams-spinner ams-spinner--${size} ${className}`}
    >
      <span style={{ display: 'none' }}>{label}</span>
    </div>
  );
};

export default Spinner;
