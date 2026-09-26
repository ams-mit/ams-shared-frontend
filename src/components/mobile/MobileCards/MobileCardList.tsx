import React from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/feedback/LoadingState';
import './MobileCards.css';

export interface MobileCardListProps {
  isLoading?: boolean;
  loadingMessage?: string;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
  children: React.ReactNode;
}

export const MobileCardList: React.FC<MobileCardListProps> = ({
  isLoading = false,
  loadingMessage = 'Loading items...',
  isEmpty = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display right now.',
  emptyActionText,
  onEmptyAction,
  children,
}) => {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={emptyActionText}
        onAction={onEmptyAction}
      />
    );
  }

  return <div className="ams-mobile-card-list">{children}</div>;
};
