import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  headerBorder?: boolean;
  footerBorder?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  footer,
  headerBorder = true,
  footerBorder = true,
  padding = 'md',
  className = '',
  style,
  onClick,
  hoverable = false,
}) => {
  const getPadding = (): string => {
    switch (padding) {
      case 'none':
        return '0';
      case 'sm':
        return '0.75rem 1rem';
      case 'lg':
        return '1.5rem 2rem';
      case 'md':
      default:
        return '1.25rem 1.5rem';
    }
  };

  const hasHeader = title || subtitle || action;

  return (
    <div
      onClick={onClick}
      className={`ams-card ${hoverable ? 'ams-card-hoverable' : ''} ${className}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all var(--transition-normal)',
        cursor: onClick || hoverable ? 'pointer' : 'default',
        ...style,
      }}
    >
      {hasHeader && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: headerBorder ? '1px solid var(--color-border-subtle)' : 'none',
          }}
        >
          <div>
            {typeof title === 'string' ? (
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{action}</div>}
        </div>
      )}
      <div style={{ padding: getPadding(), flex: 1 }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: '0.875rem 1.5rem',
            backgroundColor: 'var(--color-surface-hover)',
            borderTop: footerBorder ? '1px solid var(--color-border-subtle)' : 'none',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
