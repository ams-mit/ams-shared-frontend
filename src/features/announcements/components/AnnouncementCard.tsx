import React from 'react';
import { Megaphone, Calendar, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Announcement } from '../types/announcement.types';

export interface AnnouncementCardProps {
  announcement: Announcement;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const getRoleBadgeVariant = (targetRole: string) => {
    switch (targetRole.toUpperCase()) {
      case 'ALL':
        return 'accent';
      case 'RESIDENT':
        return 'info';
      case 'OWNER':
        return 'brand';
      case 'STAFF':
        return 'warning';
      case 'ADMIN':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const formattedDate = new Date(announcement.createdAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      padding="none"
      headerBorder={false}
      footerBorder={false}
      style={{
        borderLeft: '4px solid var(--color-accent)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {/* Top Meta Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant={getRoleBadgeVariant(announcement.targetRole)} size="sm">
              Target: {announcement.targetRole}
            </Badge>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <Calendar size={13} />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              color: 'var(--color-secondary)',
              fontWeight: 600,
            }}
          >
            <UserCheck size={14} />
            <span>{announcement.publishedBy}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.1875rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: '0.625rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Megaphone size={18} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          <span>{announcement.title}</span>
        </h3>

        {/* Content */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}
        >
          {announcement.content}
        </p>
      </div>
    </Card>
  );
};
