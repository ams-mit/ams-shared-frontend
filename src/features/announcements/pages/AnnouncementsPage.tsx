import React, { useEffect, useState } from 'react';
import { Megaphone, PlusCircle, BadgeCheck } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { AnnouncementFilter } from '../components/AnnouncementFilter';
import { AnnouncementFormModal } from '../components/AnnouncementFormModal';
import { Announcement } from '../types/announcement.types';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  fetchAnnouncements,
  archiveAnnouncement,
  deleteAnnouncement,
  clearAnnouncementFeedback,
} from '../store/announcementSlice';

export const AnnouncementsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { announcements, loading, error, successMessage } = useAppSelector(
    (state) => state.announcements
  );
  const { activeRole, currentUser } = useAppSelector((state) => state.auth);

  const isStaffOrAdmin = activeRole === 'STAFF' || activeRole === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [targetRoleFilter, setTargetRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

  useEffect(() => {
    dispatch(fetchAnnouncements(activeRole));
  }, [dispatch, activeRole]);

  const handleCreate = () => {
    setAnnouncementToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setAnnouncementToEdit(announcement);
    setIsModalOpen(true);
  };

  const handleArchive = (announcement: Announcement) => {
    dispatch(clearAnnouncementFeedback());
    dispatch(archiveAnnouncement(announcement.id));
  };

  const handleDelete = (announcement: Announcement) => {
    if (window.confirm(`Are you sure you want to delete notice "${announcement.title}"?`)) {
      dispatch(clearAnnouncementFeedback());
      dispatch(deleteAnnouncement(announcement.id));
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.publishedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      targetRoleFilter === 'ALL' ||
      a.targetRole === 'ALL' ||
      a.targetRole.toUpperCase() === targetRoleFilter.toUpperCase();

    // If resident: only show announcements targeted for ALL or their role
    if (!isStaffOrAdmin) {
      const allowed = a.targetRole === 'ALL' || a.targetRole.toUpperCase() === activeRole.toUpperCase();
      return matchesSearch && matchesRole && allowed;
    }

    return matchesSearch && matchesRole;
  });

  return (
    <PageContainer
      title={isStaffOrAdmin ? 'Official Announcements & Circulars Management' : 'Community Notice Board'}
      subtitle={
        isStaffOrAdmin
          ? 'Broadcast and manage community advisories, safety drills, and maintenance circulars'
          : `Official building management bulletins and community notices for ${currentUser.name} (${currentUser.unitId})`
      }
      actions={
        isStaffOrAdmin ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreate}
            leftIcon={<PlusCircle size={16} />}
          >
            Publish Notice
          </Button>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-secondary)',
              backgroundColor: 'var(--color-surface)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
            }}
          >
            <BadgeCheck size={14} color="var(--color-accent)" />
            <span>Verified Official Bulletins</span>
          </div>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Role context notice */}
        {isStaffOrAdmin ? (
          <Alert
            type="info"
            message="Broadcast Authority: Announcements published here will be distributed to residents, owners, or staff based on your selected target audience."
          />
        ) : (
          <Alert
            type="info"
            message="Showing bulletins applicable to Residents and General Community. Contact Management Office for urgent inquiries."
          />
        )}

        {/* Feedback messages */}
        {error && (
          <Alert
            type="error"
            message={error}
            onDismiss={() => dispatch(clearAnnouncementFeedback())}
          />
        )}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onDismiss={() => dispatch(clearAnnouncementFeedback())}
          />
        )}

        {/* Search & Filter Bar */}
        <AnnouncementFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          targetRoleFilter={targetRoleFilter}
          onTargetRoleFilterChange={setTargetRoleFilter}
        />

        {/* Announcements List */}
        {loading && announcements.length === 0 ? (
          <LoadingState message="Fetching official community circulars..." />
        ) : filteredAnnouncements.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={28} />}
            title="No announcements found"
            description="There are currently no circulars or notices matching your selected audience filter."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setTargetRoleFilter('ALL');
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Publish / Edit Modal */}
        <AnnouncementFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          announcementToEdit={announcementToEdit}
        />
      </div>
    </PageContainer>
  );
};
