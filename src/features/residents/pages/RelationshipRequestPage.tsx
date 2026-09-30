import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { withFlash } from '@/hooks/useFlashMessage';
import { useCurrentAccess } from '@/features/users/hooks/useCurrentAccess';
import { relationshipApi } from '../api/relationshipApi';
import { RELATIONSHIP_TYPE_CONFIG } from '../constants/relationships';
import { RelationshipRequestForm } from '../components/RelationshipRequestForm';
import type { SubmitRelationshipRequest } from '../types/relationship.types';

export const RelationshipRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, name, email } = useCurrentAccess();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (request: SubmitRelationshipRequest) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await relationshipApi.submitRequest({ userId, name, email }, request);
      navigate(
        ROUTES.RELATIONSHIPS,
        withFlash(
          `Your ${RELATIONSHIP_TYPE_CONFIG[created.relationshipType].label} request for ${created.unitReference} was submitted and is pending review.`
        )
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Your request could not be submitted.');
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Request Apartment Relationship"
      subtitle="Link your account to a unit you own or live in. Requests are verified by an administrator."
      maxWidth="860px"
      actions={
        <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.RELATIONSHIPS)}>
          My Relationships
        </Button>
      }
    >
      <Card padding="lg">
        <RelationshipRequestForm
          isSubmitting={isSubmitting}
          submitError={submitError}
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.RELATIONSHIPS)}
        />
      </Card>
    </PageContainer>
  );
};

export default RelationshipRequestPage;
