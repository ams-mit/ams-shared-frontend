import React from 'react';
import { Card } from '@/components/ui/Card';

export interface AuthPageShellProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Full-screen layout shared by the sign-in, registration and password pages. */
export const AuthPageShell: React.FC<AuthPageShellProps> = ({
  icon,
  title,
  subtitle,
  maxWidth = '440px',
  children,
  footer,
}) => (
  <main
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-background)',
      padding: '1.5rem 1rem',
    }}
  >
    <div style={{ width: '100%', maxWidth }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div
          aria-hidden="true"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          {icon}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{title}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>{subtitle}</p>
      </div>
      <Card padding="lg">{children}</Card>
      {footer && (
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '1rem' }}>
          {footer}
        </div>
      )}
    </div>
  </main>
);
