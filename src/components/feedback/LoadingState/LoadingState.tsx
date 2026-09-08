import React from 'react';
import Spinner from '@/components/ui/Spinner';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  size = 'md',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        gap: '12px',
        color: 'var(--color-text-muted)',
      }}
    >
      <Spinner size={size} />
      <span style={{ fontSize: '0.875rem' }}>{message}</span>
    </div>
  );
};

export default LoadingState;
