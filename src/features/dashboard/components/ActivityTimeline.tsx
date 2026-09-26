import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { CalendarCheck, Users, Megaphone, ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

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
  const navigate = useNavigate();

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

  const getRoute = (type: ActivityItem['type']) => {
    switch (type) {
      case 'booking':
        return ROUTES.RESERVATIONS;
      case 'visitor':
        return ROUTES.VISITORS;
      case 'announcement':
        return ROUTES.ANNOUNCEMENTS;
    }
  };

  return (
    <Card title="Live Community Activity Stream" subtitle="Real-time operations, gate arrivals, and notices">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {activities.map((item, index) => (
          <div
            key={item.id}
            onClick={() => navigate(getRoute(item.type))}
            title={`Click to view ${item.type} details`}
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              position: 'relative',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: '27px',
                  top: '38px',
                  bottom: '-8px',
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {item.title}
                  <ArrowUpRight size={13} color="var(--color-text-muted)" />
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

