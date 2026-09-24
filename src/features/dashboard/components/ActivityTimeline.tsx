import React from 'react';
import { Card } from '@/components/ui/Card';
import { CalendarCheck, Users, Megaphone } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'booking' | 'visitor' | 'announcement';
  title: string;
  description: string;
  time: string;
}

export interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'booking':
        return <CalendarCheck size={16} color="var(--color-accent)" />;
      case 'visitor':
        return <Users size={16} color="var(--color-primary)" />;
      case 'announcement':
        return <Megaphone size={16} color="var(--color-warning)" />;
    }
  };

  return (
    <Card title="Live Community Activity Stream" subtitle="Real-time operations, gate arrivals, and notices">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activities.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: '15px',
                  top: '28px',
                  bottom: '-12px',
                  width: '2px',
                  backgroundColor: 'var(--color-border)',
                }}
              />
            )}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              {getIcon(item.type)}
            </div>
            <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  {item.title}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.time}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
