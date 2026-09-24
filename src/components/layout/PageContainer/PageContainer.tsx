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
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: '1.25rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                marginTop: '0.25rem',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div>{children}</div>
    </div>
  );
};
