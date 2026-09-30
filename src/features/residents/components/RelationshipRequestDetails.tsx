import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/utils/date';
import { ProfileField, ProfileFieldList } from '@/features/users/components/ProfileField';
import { RELATIONSHIP_TYPE_CONFIG } from '../constants/relationships';
import type { ApartmentRelationship, UnitValidation } from '../types/relationship.types';
import { RelationshipStatusBadge } from './RelationshipStatusBadge';

const UnitValidationValue: React.FC<{ validation?: UnitValidation }> = ({ validation }) => {
  if (!validation) return null;
  const isValid = validation.status === 'VALID' || validation.status === 'APPROVED';
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
      <Badge variant={isValid ? 'success' : 'neutral'} size="sm">
        {validation.status.replace(/_/g, ' ').toLowerCase()}
      </Badge>
      {validation.reason && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>{validation.reason}</span>
      )}
    </span>
  );
};

/** Full request information shown to an administrator before a review decision. */
export const RelationshipRequestDetails: React.FC<{ request: ApartmentRelationship }> = ({ request }) => (
  <ProfileFieldList>
    <ProfileField label="Requester">{request.requesterName}</ProfileField>
    <ProfileField label="Requester email">{request.requesterEmail}</ProfileField>
    <ProfileField label="Unit">{request.unitReference}</ProfileField>
    <ProfileField label="Relationship">{RELATIONSHIP_TYPE_CONFIG[request.relationshipType].label}</ProfileField>
    <ProfileField label="Unit check" emptyText="Not checked">
      {request.unitValidation && <UnitValidationValue validation={request.unitValidation} />}
    </ProfileField>
    <ProfileField label="Submitted">{formatDateTime(request.createdAt)}</ProfileField>
    <ProfileField label="Status">
      <RelationshipStatusBadge status={request.status} />
    </ProfileField>
    <ProfileField label="Supporting information" emptyText="None">
      {request.supportingInfo}
    </ProfileField>
    {request.decidedAt && (
      <>
        <ProfileField label="Decided">
          {formatDateTime(request.decidedAt)}
          {request.decidedBy ? ` by ${request.decidedBy}` : ''}
        </ProfileField>
        {request.decisionReason && <ProfileField label="Rejection reason">{request.decisionReason}</ProfileField>}
      </>
    )}
  </ProfileFieldList>
);
