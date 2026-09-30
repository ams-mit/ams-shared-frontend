// Field names follow resident-management-service (RelationshipRequest / RelationshipResponse).

export type RelationshipType = 'OWNER' | 'TENANT_RESIDENT';

export type RelationshipStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Result of checking the unit with Group 2's property service. */
export interface UnitValidation {
  status: string;
  reason?: string;
}

export interface ApartmentRelationship {
  relationshipId: string;
  requesterUserId: string;
  /** Display name and email come from the identity service; shown on admin screens only. */
  requesterName: string;
  requesterEmail: string;
  relationshipType: RelationshipType;
  /** Unit reference owned by Group 2 (Property & Units); displayed as-is here. */
  unitReference: string;
  supportingInfo?: string;
  status: RelationshipStatus;
  decisionReason?: string;
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
  unitValidation?: UnitValidation;
}

export interface RelationshipRequester {
  userId: string;
  name: string;
  email: string;
}

export interface SubmitRelationshipRequest {
  relationshipType: RelationshipType;
  unitReference: string;
  supportingInfo?: string;
}

export interface RelationshipRequestFormValues {
  unitReference: string;
  relationshipType: RelationshipType | '';
  supportingInfo: string;
  confirmAccuracy: boolean;
}
