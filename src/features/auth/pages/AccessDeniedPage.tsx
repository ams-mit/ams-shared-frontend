import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          padding: '24px 0',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          <Card>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 0',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-danger, #ef4444)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <ShieldAlert size={32} />
              </div>

              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  marginBottom: '8px',
                }}
              >
                Access Denied
              </h1>

              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--color-secondary)',
                  marginBottom: '28px',
                  maxWidth: '360px',
                  lineHeight: 1.5,
                }}
              >
                You don't have permission to access this page.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  width: '100%',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="primary"
                  leftIcon={<LayoutDashboard size={16} />}
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                >
                  Return to Dashboard
                </Button>

                <Button
                  variant="secondary"
                  leftIcon={<ArrowLeft size={16} />}
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default AccessDeniedPage;
