import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary': // Accent #2F8B8B
        return {
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-text-inverse)',
          border: '1px solid var(--color-accent)',
        };
      case 'brand': // Corporate Navy #1E3A5F
        return {
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-inverse)',
          border: '1px solid var(--color-primary)',
        };
      case 'secondary': // Slate Blue #4E6D8A
        return {
          backgroundColor: 'var(--color-secondary-subtle)',
          color: 'var(--color-secondary)',
          border: '1px solid var(--color-border)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border-strong)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-danger)',
          color: 'var(--color-text-inverse)',
          border: '1px solid var(--color-danger)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-secondary)',
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.375rem 0.75rem',
          fontSize: '0.8125rem',
          borderRadius: 'var(--radius-sm)',
          gap: '0.375rem',
        };
      case 'lg':
        return {
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: 'var(--radius-md)',
          gap: '0.625rem',
        };
      case 'md':
      default:
        return {
          padding: '0.5rem 1.125rem',
          fontSize: '0.875rem',
          borderRadius: 'var(--radius-md)',
          gap: '0.5rem',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'all var(--transition-fast)',
    boxShadow: variant === 'ghost' || variant === 'outline' ? 'none' : 'var(--shadow-xs)',
    whiteSpace: 'nowrap',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={baseStyles}
      className={`ams-btn ams-btn-${variant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      ) : (
        leftIcon && <span style={{ display: 'inline-flex' }}>{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span style={{ display: 'inline-flex' }}>{rightIcon}</span>}
    </button>
  );
};
