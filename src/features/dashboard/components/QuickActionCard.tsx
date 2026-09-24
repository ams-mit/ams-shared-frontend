import React from 'react';
import { Card } from '@/components/ui/Card';
import { ChevronRight } from 'lucide-react';

export interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  accentColor?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <Card padding="md" hoverable onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {title}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
              {description}
            </p>
          </div>
        </div>
        <ChevronRight size={18} color="var(--color-secondary)" />
      </div>
    </Card>
  );
};
