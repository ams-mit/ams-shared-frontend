import React from 'react';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  ...props
}) => {
  return (
    <div className={`ams-card ${className}`} {...props}>
      {(title || headerAction) && (
        <div className="ams-card-header">
          <div>
            {title && <h3 className="ams-card-title">{title}</h3>}
            {subtitle && <p className="ams-card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="ams-card-action">{headerAction}</div>}
        </div>
      )}
      <div className="ams-card-body">{children}</div>
      {footer && <div className="ams-card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
