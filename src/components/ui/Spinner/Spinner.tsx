import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: React.CSSProperties;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'var(--color-accent)',
  style,
}) => {
  const getDimension = (): number => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 36;
      case 'md':
      default:
        return 24;
    }
  };

  const dim = getDimension();

  return (
    <div
      style={{
        display: 'inline-block',
        width: `${dim}px`,
        height: `${dim}px`,
        border: `3px solid rgba(47, 139, 139, 0.2)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        ...style,
      }}
      role="status"
      aria-label="Loading"
    />
  );
};
