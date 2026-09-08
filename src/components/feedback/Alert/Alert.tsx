import React from 'react';
import './Alert.css';

export interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  className = '',
  icon,
}) => {
  return (
    <div
      role="alert"
      className={`ams-alert ams-alert--${variant} ${className}`}
    >
      {icon && <div className="ams-alert-icon">{icon}</div>}
      <div className="ams-alert-content">
        {title && <div className="ams-alert-title">{title}</div>}
        <div className="ams-alert-message">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
