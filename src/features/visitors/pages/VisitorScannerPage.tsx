import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import { VisitorStatusBadge } from '../components/VisitorStatusBadge';
import { visitorApi } from '../api/visitorApi';
import { Visitor } from '../types/visitor.types';
import { useAppDispatch } from '@/app/store/hooks';
import { checkInVisitor, checkOutVisitor } from '../store/visitorSlice';
import { QrCode, Search, CheckCircle2, LogOut, ArrowLeft, ShieldCheck, User, Home, Calendar, Phone, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export const VisitorScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [passCodeInput, setPassCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verifiedVisitor, setVerifiedVisitor] = useState<Visitor | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || passCodeInput).trim();
    if (!code) {
      setError('Please input or scan a pass code.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setVerifiedVisitor(null);

    try {
      const visitor = await visitorApi.verifyPassCode(code);
      setVerifiedVisitor(visitor);
      setSuccessMessage(`Valid pass confirmed for ${visitor.visitorName}!`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or unrecognized gate pass code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInNow = async (id: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await visitorApi.checkInVisitor(id);
      dispatch(checkInVisitor(id));
      setVerifiedVisitor(updated);
      setSuccessMessage(`${updated.visitorName} successfully checked in at the gate!`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check in visitor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOutNow = async (id: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await visitorApi.checkOutVisitor(id);
      dispatch(checkOutVisitor(id));
      setVerifiedVisitor(updated);
      setSuccessMessage(`${updated.visitorName} successfully checked out of the premises!`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check out visitor.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageContainer
      title="Security Gate QR & Pass Code Scanner"
      subtitle="Verify digital guest passes and authorize gate entry or departure"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTES.VISITORS)}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Visitors Roster
        </Button>
      }
    >
      <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
        {successMessage && <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}

        {/* Pass Code Input Card */}
        <Card
          title="Gate Checkpoint Scanner"
          subtitle="Scan optical QR barcode or enter the alphanumeric Pass Code"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Pass Reference / QR Code"
                  placeholder="e.g. PASS-A1B2C3D4 or #VIS-1"
                  value={passCodeInput}
                  onChange={(e) => setPassCodeInput(e.target.value)}
                  leftIcon={<QrCode size={16} />}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerify();
                  }}
                />
              </div>
              <Button
                variant="primary"
                onClick={() => handleVerify()}
                isLoading={loading}
                leftIcon={<Search size={16} />}
              >
                Verify Pass
              </Button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span>Security Tip: Residents are provided with a unique pass code upon pre-registration.</span>
            </div>
          </div>
        </Card>

        {/* Verified Pass Details Card */}
        {verifiedVisitor && (
          <Card
            title="Pass Verification Result"
            action={<VisitorStatusBadge status={verifiedVisitor.status} size="md" />}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--color-surface-hover)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                  }}
                >
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {verifiedVisitor.visitorName}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Pass Reference: <strong>{verifiedVisitor.passCode || `#VIS-${verifiedVisitor.id}`}</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Home size={16} color="var(--color-secondary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Destination Unit</div>
                    <div style={{ fontWeight: 600 }}>{verifiedVisitor.unitId}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} color="var(--color-secondary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Host Resident ID</div>
                    <div style={{ fontWeight: 600 }}>{verifiedVisitor.residentId}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--color-secondary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Scheduled Date</div>
                    <div style={{ fontWeight: 600 }}>{verifiedVisitor.visitDate}</div>
                  </div>
                </div>

                {verifiedVisitor.visitorPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} color="var(--color-secondary)" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Visitor Phone</div>
                      <div style={{ fontWeight: 600 }}>{verifiedVisitor.visitorPhone}</div>
                    </div>
                  </div>
                )}

                {verifiedVisitor.vehicleNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Car size={16} color="var(--color-secondary)" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Vehicle Plate</div>
                      <div style={{ fontWeight: 600 }}>{verifiedVisitor.vehicleNumber}</div>
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: '0.8125rem',
                }}
              >
                <strong>Purpose of Visit:</strong> {verifiedVisitor.purpose}
              </div>

              {/* Action Buttons based on status */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                {verifiedVisitor.status === 'EXPECTED' && (
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={actionLoading}
                    onClick={() => handleCheckInNow(verifiedVisitor.id)}
                    leftIcon={<CheckCircle2 size={18} />}
                  >
                    Authorize Entry & Check In
                  </Button>
                )}

                {verifiedVisitor.status === 'CHECKED_IN' && (
                  <Button
                    variant="outline"
                    size="md"
                    isLoading={actionLoading}
                    onClick={() => handleCheckOutNow(verifiedVisitor.id)}
                    leftIcon={<LogOut size={18} />}
                  >
                    Confirm Departure & Check Out
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};
