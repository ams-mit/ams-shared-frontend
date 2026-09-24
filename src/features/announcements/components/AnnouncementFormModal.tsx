import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/feedback/Alert';
import { AnnouncementRequest } from '../types/announcement.types';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { publishAnnouncement, clearAnnouncementFeedback } from '../store/announcementSlice';

export interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { actionLoading, error, successMessage } = useAppSelector((state) => state.announcements);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [publishedBy, setPublishedBy] = useState(
    currentUser.role === 'ADMIN' ? 'Building Management Office' : currentUser.name
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearAnnouncementFeedback());

    if (!title.trim()) {
      setLocalError('Please specify the notice title.');
      return;
    }
    if (!content.trim()) {
      setLocalError('Please write the announcement text content.');
      return;
    }

    const request: AnnouncementRequest = {
      title: title.trim(),
      content: content.trim(),
      targetRole,
      publishedBy: publishedBy.trim() || 'Building Operations',
    };

    const res = await dispatch(publishAnnouncement(request));
    if (publishAnnouncement.fulfilled.match(res)) {
      setTimeout(() => {
        setTitle('');
        setContent('');
        onClose();
      }, 1200);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish Official Notice"
      subtitle="Broadcast instructions, maintenance bulletins, or community alerts"
      maxWidth="580px"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={actionLoading}
          >
            Publish Notice
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {localError && <Alert type="error" message={localError} onDismiss={() => setLocalError(null)} />}
        {error && <Alert type="error" message={error} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        <Input
          label="Notice Title / Headline"
          placeholder="e.g. Scheduled Water Maintenance & Tank Inspection"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Target Audience"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Community Members' },
              { value: 'RESIDENT', label: 'Residents Only' },
              { value: 'OWNER', label: 'Property Owners' },
              { value: 'STAFF', label: 'Facility & Security Staff' },
              { value: 'ADMIN', label: 'Administration Office' },
            ]}
          />
          <Input
            label="Publisher Signature"
            required
            value={publishedBy}
            onChange={(e) => setPublishedBy(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Notice Content <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <textarea
            rows={5}
            required
            placeholder="Type the full announcement, advisory or guidelines..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>
      </form>
    </Modal>
  );
};
