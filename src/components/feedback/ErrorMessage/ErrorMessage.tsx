import React from 'react';
import Alert from '@/components/feedback/Alert';
import Button from '@/components/ui/Button';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
}) => {
  return (
    <Alert variant="error" title={title}>
      <p style={{ marginBottom: onRetry ? '8px' : 0 }}>{message}</p>
      {onRetry && (
        <Button size="sm" variant="danger" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Alert>
  );
};

export default ErrorMessage;
