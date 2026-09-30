import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { hasErrors, type FieldErrors } from '@/features/users/validation/userValidation';
import {
  PLACEHOLDER_UNIT_OPTIONS,
  RELATIONSHIP_TYPES,
  RELATIONSHIP_TYPE_CONFIG,
  REQUEST_NOTES_MAX_LENGTH,
} from '../constants/relationships';
import type { RelationshipRequestFormValues, SubmitRelationshipRequest } from '../types/relationship.types';
import { TextAreaField } from './TextAreaField';

const EMPTY_VALUES: RelationshipRequestFormValues = {
  unitReference: '',
  relationshipType: '',
  supportingInfo: '',
  confirmAccuracy: false,
};

const validate = (values: RelationshipRequestFormValues): FieldErrors<RelationshipRequestFormValues> => {
  const errors: FieldErrors<RelationshipRequestFormValues> = {};
  if (!values.unitReference) errors.unitReference = 'Select the apartment unit.';
  if (!values.relationshipType) errors.relationshipType = 'Choose your relationship to the unit.';
  if (!values.confirmAccuracy) errors.confirmAccuracy = 'Confirm that the information is accurate.';
  return errors;
};

export interface RelationshipRequestFormProps {
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (request: SubmitRelationshipRequest) => void;
  onCancel: () => void;
}

export const RelationshipRequestForm: React.FC<RelationshipRequestFormProps> = ({
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}) => {
  const [values, setValues] = useState<RelationshipRequestFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors<RelationshipRequestFormValues>>({});

  const setField = <K extends keyof RelationshipRequestFormValues>(field: K, value: RelationshipRequestFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate(values);
    setErrors(validation);
    if (hasErrors(validation) || !values.relationshipType) return;
    onSubmit({
      unitReference: values.unitReference,
      relationshipType: values.relationshipType,
      supportingInfo: values.supportingInfo,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {hasErrors(errors) && (
        <Alert
          key={Object.keys(errors).join()}
          type="error"
          title="Please complete the required fields"
          message="Your request has not been submitted yet."
          autoDismiss={false}
          showDismissButton={false}
        />
      )}
      {submitError && (
        <Alert key={submitError} type="error" title="Request not submitted" message={submitError} autoDismiss={false} />
      )}

      <Select
        label="Apartment Unit"
        required
        options={PLACEHOLDER_UNIT_OPTIONS}
        value={values.unitReference}
        onChange={(e) => setField('unitReference', e.target.value)}
        placeholder="Select a unit..."
        error={errors.unitReference}
        disabled={isSubmitting}
        helperText="Can't find your unit? Contact the building management office."
      />

      <fieldset
        aria-describedby={errors.relationshipType ? 'relationship-type-error' : undefined}
        style={{ border: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <legend style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
          Relationship Type <span style={{ color: 'var(--color-danger)' }}>*</span>
        </legend>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.625rem' }}>
          {RELATIONSHIP_TYPES.map((type) => {
            const checked = values.relationshipType === type;
            return (
              <label
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: checked
                    ? '1.5px solid var(--color-accent)'
                    : errors.relationshipType
                    ? '1.5px solid var(--color-danger)'
                    : '1px solid var(--color-border)',
                  backgroundColor: checked ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="relationshipType"
                  value={type}
                  checked={checked}
                  disabled={isSubmitting}
                  onChange={() => setField('relationshipType', type)}
                  style={{ marginTop: '0.2rem', accentColor: 'var(--color-accent)' }}
                />
                <span>
                  <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600 }}>
                    {RELATIONSHIP_TYPE_CONFIG[type].label}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {RELATIONSHIP_TYPE_CONFIG[type].description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {errors.relationshipType && (
          <span id="relationship-type-error" style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 500 }}>
            {errors.relationshipType}
          </span>
        )}
      </fieldset>

      <TextAreaField
        label="Supporting Information"
        rows={4}
        maxLength={REQUEST_NOTES_MAX_LENGTH}
        value={values.supportingInfo}
        onChange={(e) => setField('supportingInfo', e.target.value)}
        disabled={isSubmitting}
        placeholder="e.g. lease start date, title deed number, or anything that helps verify your request."
        helperText="Optional."
      />

      <div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={values.confirmAccuracy}
            onChange={(e) => setField('confirmAccuracy', e.target.checked)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.confirmAccuracy)}
            aria-describedby={errors.confirmAccuracy ? 'confirm-accuracy-error' : undefined}
            style={{ marginTop: '0.2rem', accentColor: 'var(--color-accent)' }}
          />
          <span>
            I confirm this information is accurate and understand an administrator will verify it.{' '}
            <span style={{ color: 'var(--color-danger)' }}>*</span>
          </span>
        </label>
        {errors.confirmAccuracy && (
          <span
            id="confirm-accuracy-error"
            style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 500 }}
          >
            {errors.confirmAccuracy}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border-subtle)',
        }}
      >
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon={<Send size={16} />}>
          Submit Request
        </Button>
      </div>
    </form>
  );
};
