import React from 'react';
import { Card } from '@/components/ui/Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive,
}) => {
  return (
    <Card padding="md" headerBorder={false} footerBorder={false}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              lineHeight: 1.1,
              marginTop: '0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </div>
          {subtitle && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginTop: '0.5rem',
                color: trendPositive ? 'var(--color-success)' : 'var(--color-text-muted)',
              }}
            >
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
