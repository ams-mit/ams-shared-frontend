import React from 'react';
import './PageContainer.css';

export interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  actions,
  children,
  className = '',
}) => {
  return (
    <main className={`ams-page-container ${className}`}>
      {(title || actions) && (
        <header className="ams-page-header">
          <div>
            {title && <h1 className="ams-page-title">{title}</h1>}
            {description && <p className="ams-page-description">{description}</p>}
          </div>
          {actions && <div className="ams-page-actions">{actions}</div>}
        </header>
      )}
      <div className="ams-page-content">{children}</div>
    </main>
  );
};

export default PageContainer;
