import React from 'react';

export interface PageContainerProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  actions,
  children,
  maxWidth = '1400px',
}) => {
  return (
    <div
      className="ams-page-container"
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        padding: '1.75rem 2rem 2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Page Header */}
      <div
        className="ams-page-header"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: '1.25rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h1
            className="ams-page-title"
            style={{
              fontWeight: 800,
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="ams-page-subtitle"
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                marginTop: '0.25rem',
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="ams-page-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="ams-page-content">{children}</div>
    </div>
  );
};

