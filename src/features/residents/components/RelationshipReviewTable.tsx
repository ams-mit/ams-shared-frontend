import React from 'react';
import { Check, Eye, X } from 'lucide-react';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/date';
import { RELATIONSHIP_TYPE_CONFIG } from '../constants/relationships';
import type { ApartmentRelationship } from '../types/relationship.types';
import { RelationshipStatusBadge } from './RelationshipStatusBadge';

export interface RelationshipReviewTableProps {
  requests: ApartmentRelationship[];
  onView: (request: ApartmentRelationship) => void;
  onApprove: (request: ApartmentRelationship) => void;
  onReject: (request: ApartmentRelationship) => void;
}

export const RelationshipReviewTable: React.FC<RelationshipReviewTableProps> = ({
  requests,
  onView,
  onApprove,
  onReject,
}) => {
  const columns: Column<ApartmentRelationship>[] = [
    {
      key: 'requester',
      header: 'Requester',
      render: (req) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', minWidth: '170px' }}>
          <span style={{ fontWeight: 600 }}>{req.requesterName}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{req.requesterEmail}</span>
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (req) => <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{req.unitReference}</span>,
    },
    {
      key: 'type',
      header: 'Relationship',
      render: (req) => <span style={{ whiteSpace: 'nowrap' }}>{RELATIONSHIP_TYPE_CONFIG[req.relationshipType].label}</span>,
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (req) => <span style={{ whiteSpace: 'nowrap' }}>{formatDate(req.createdAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (req) => <RelationshipStatusBadge status={req.status} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (req) => {
        const label = `${req.requesterName}'s request for ${req.unitReference}`;
        return (
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.375rem' }}>
            <Button size="sm" variant="ghost" leftIcon={<Eye size={14} />} onClick={() => onView(req)} aria-label={`View ${label}`}>
              Details
            </Button>
            {req.status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Check size={14} />}
                  onClick={() => onApprove(req)}
                  aria-label={`Approve ${label}`}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<X size={14} />}
                  onClick={() => onReject(req)}
                  aria-label={`Reject ${label}`}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return <Table columns={columns} data={requests} keyExtractor={(req) => req.relationshipId} />;
};
