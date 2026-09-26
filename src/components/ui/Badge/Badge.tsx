import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent' | 'brand';
  size?: 'sm' | 'md';
  dot?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  style,
  className = '',
}) => {
  const getVariantStyles = (): { bg: string; color: string; border: string; dotColor: string } => {
    switch (variant) {
      case 'success':
        return {
          bg: 'var(--color-success-bg)',
          color: 'var(--color-success-text)',
          border: 'var(--color-success-border)',
          dotColor: 'var(--color-success)',
        };
      case 'warning':
        return {
          bg: 'var(--color-warning-bg)',
          color: 'var(--color-warning-text)',
          border: 'var(--color-warning-border)',
          dotColor: 'var(--color-warning)',
        };
      case 'danger':
        return {
          bg: 'var(--color-danger-bg)',
          color: 'var(--color-danger-text)',
          border: 'var(--color-danger-border)',
          dotColor: 'var(--color-danger)',
        };
      case 'info':
        return {
          bg: 'var(--color-info-bg)',
          color: 'var(--color-info-text)',
          border: 'var(--color-info-border)',
          dotColor: 'var(--color-info)',
        };
      case 'accent':
        return {
          bg: 'var(--color-accent-light)',
          color: 'var(--color-accent-active)',
          border: 'rgba(47, 139, 139, 0.3)',
          dotColor: 'var(--color-accent)',
        };
      case 'brand':
        return {
          bg: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
          border: 'rgba(30, 58, 95, 0.2)',
          dotColor: 'var(--color-primary)',
        };
      case 'neutral':
      default:
        return {
          bg: 'var(--color-surface-sunken)',
          color: 'var(--color-secondary)',
          border: 'var(--color-border)',
          dotColor: 'var(--color-secondary)',
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <span
      className={`ams-badge ams-badge-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: size === 'sm' ? '0.125rem 0.5rem' : '0.25rem 0.625rem',
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        backgroundColor: vStyles.bg,
        color: vStyles.color,
        border: `1px solid ${vStyles.border}`,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: vStyles.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};
