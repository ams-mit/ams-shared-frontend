import React from 'react';
import { Building2, CalendarDays, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/date';
import { RELATIONSHIP_TYPE_CONFIG } from '../constants/relationships';
import type { ApartmentRelationship } from '../types/relationship.types';
import { RelationshipStatusBadge } from './RelationshipStatusBadge';

const MetaRow: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem' }}>
    <span style={{ display: 'inline-flex', color: 'var(--color-secondary)', marginTop: '1px' }} aria-hidden="true">
      {icon}
    </span>
    <span style={{ color: 'var(--color-text-muted)', minWidth: '84px' }}>{label}</span>
    <span style={{ color: 'var(--color-text)', flex: 1 }}>{children}</span>
  </div>
);

export const RelationshipCard: React.FC<{ relationship: ApartmentRelationship }> = ({ relationship }) => {
  const { unitReference, relationshipType, status } = relationship;

  return (
    <Card padding="md" style={{ height: '100%' }}>
      <article aria-label={`${RELATIONSHIP_TYPE_CONFIG[relationshipType].label} of ${unitReference}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              aria-hidden="true"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Building2 size={20} />
            </span>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{unitReference}</h3>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                {RELATIONSHIP_TYPE_CONFIG[relationshipType].label}
              </div>
            </div>
          </div>
          <RelationshipStatusBadge status={status} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <MetaRow icon={<CalendarDays size={14} />} label="Submitted">
            {formatDate(relationship.createdAt)}
          </MetaRow>
          {relationship.decidedAt && (
            <MetaRow icon={<CalendarDays size={14} />} label="Decided">
              {formatDate(relationship.decidedAt)}
            </MetaRow>
          )}
          {relationship.supportingInfo && (
            <MetaRow icon={<MessageSquare size={14} />} label="Your details">
              {relationship.supportingInfo}
            </MetaRow>
          )}
        </div>

        {status === 'PENDING' && (
          <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            An administrator will review this request. You will get access to unit features once it is approved.
          </p>
        )}
        {status === 'REJECTED' && relationship.decisionReason && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)',
              fontSize: '0.8125rem',
              color: 'var(--color-danger-text)',
            }}
          >
            <strong>Reason for rejection:</strong> {relationship.decisionReason}
          </div>
        )}
      </article>
    </Card>
  );
};
