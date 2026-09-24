import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export interface AnnouncementFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  targetRoleFilter: string;
  onTargetRoleFilterChange: (value: string) => void;
}

export const AnnouncementFilter: React.FC<AnnouncementFilterProps> = ({
  searchTerm,
  onSearchChange,
  targetRoleFilter,
  onTargetRoleFilterChange,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.25rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div style={{ flex: '1 1 300px' }}>
        <Input
          placeholder="Search by keywords, subject, or author..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>
      <div style={{ width: '220px' }}>
        <Select
          value={targetRoleFilter}
          onChange={(e) => onTargetRoleFilterChange(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Role Audiences' },
            { value: 'RESIDENT', label: 'Residents' },
            { value: 'OWNER', label: 'Owners' },
            { value: 'STAFF', label: 'Staff' },
            { value: 'ADMIN', label: 'Administration' },
          ]}
        />
      </div>
    </div>
  );
};
