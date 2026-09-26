import React from 'react';
import { Megaphone, Calendar, UserCheck, Edit2, Archive, Trash2, AlertTriangle, Tag, Paperclip } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Announcement } from '../types/announcement.types';
import { useAppSelector } from '@/app/store/hooks';

export interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit?: (announcement: Announcement) => void;
  onArchive?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const { activeRole } = useAppSelector((state) => state.auth);
  const isStaffOrAdmin = activeRole === 'STAFF' || activeRole === 'ADMIN';

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

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const p = priority.toUpperCase();
    if (p === 'HIGH') {
      return (
        <Badge variant="danger" size="sm">
          High Priority
        </Badge>
      );
    }
    if (p === 'LOW') {
      return (
        <Badge variant="neutral" size="sm">
          Low Priority
        </Badge>
      );
    }
    return (
      <Badge variant="info" size="sm">
        Standard
      </Badge>
    );
  };

  const formattedDate = new Date(announcement.createdAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isArchived = announcement.status === 'ARCHIVED';

  return (
    <Card
      padding="none"
      headerBorder={false}
      footerBorder={false}
      style={{
        borderLeft: isArchived
          ? '4px solid var(--color-border)'
          : announcement.priority === 'HIGH'
          ? '4px solid var(--color-danger)'
          : '4px solid var(--color-accent)',
        overflow: 'hidden',
        opacity: isArchived ? 0.75 : 1,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant={getRoleBadgeVariant(announcement.targetRole)} size="sm">
              Target: {announcement.targetRole}
            </Badge>

            {announcement.category && (
              <Badge variant="neutral" size="sm">
                <Tag size={10} style={{ marginRight: '3px' }} />
                {announcement.category}
              </Badge>
            )}

            {getPriorityBadge(announcement.priority)}

            {isArchived && (
              <Badge variant="neutral" size="sm">
                Archived
              </Badge>
            )}

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

        {announcement.attachmentUrl && (
          <div style={{ marginTop: '0.75rem' }}>
            <a
              href={announcement.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                color: 'var(--color-accent)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <Paperclip size={12} /> View Attached Document / Circular
            </a>
          </div>
        )}

        {/* Admin / Staff Action Buttons */}
        {isStaffOrAdmin && (
          <div
            style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
            }}
          >
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(announcement)}
                leftIcon={<Edit2 size={13} />}
              >
                Edit
              </Button>
            )}

            {!isArchived && onArchive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onArchive(announcement)}
                leftIcon={<Archive size={13} />}
                title="Archive Announcement"
              >
                Archive
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(announcement)}
                leftIcon={<Trash2 size={13} />}
                style={{ color: 'var(--color-danger)' }}
                title="Delete Announcement"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
