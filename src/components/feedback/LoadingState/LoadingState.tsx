import React from 'react';
import { Spinner } from '@/components/ui/Spinner';

export interface LoadingStateProps {
  message?: string;
  minHeight?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  minHeight = '240px',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        minHeight,
        width: '100%',
        color: 'var(--color-secondary)',
      }}
    >
      <Spinner size="lg" color="var(--color-accent)" />
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
        {message}
      </span>
    </div>
  );
};
