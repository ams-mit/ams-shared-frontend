import React from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`ams-empty-state ${className}`}>
      {icon && <div className="ams-empty-icon">{icon}</div>}
      <h4 className="ams-empty-title">{title}</h4>
      {description && <p className="ams-empty-description">{description}</p>}
      {action && <div className="ams-empty-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
