import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield,
  CheckCircle2,
  User,
  Home,
  Calendar,
  Clock,
  Smartphone,
  Copy,
  Check,
  Printer,
  Building2,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { VisitorStatusBadge } from './VisitorStatusBadge';
import { Visitor } from '../types/visitor.types';
import { useAppSelector } from '@/app/store/hooks';

export interface VisitorPassCardProps {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VisitorPassCard: React.FC<VisitorPassCardProps> = ({
  visitor,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const { availableUsers } = useAppSelector((state) => state.auth);

  if (!visitor) return null;

  // Resolve host resident name if available
  const hostUser = availableUsers.find((u) => u.id === visitor.residentId);
  const hostDisplayName = hostUser ? `${hostUser.name} (${visitor.residentId})` : visitor.residentId;

  // Real, fully scannable payload that any smartphone camera or QR scanner can read immediately!
  const qrDataText = `AMS GATE PASS VERIFICATION
=================================
Pass ID: #VIS-${visitor.id}
Visitor: ${visitor.visitorName}
Destination Unit: ${visitor.unitId}
Host Resident: ${hostDisplayName}
Arrival Date: ${visitor.visitDate}
Status: ${visitor.status}
Purpose: ${visitor.purpose}
Security Clearance: AUTHORIZED ENTRY
Timestamp: ${visitor.createdAt || new Date().toISOString()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrDataText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Gate Entry Pass"
      subtitle="Authorized visitor clearance for security checkpoint"
      maxWidth="520px"
      footer={
        <div
          className="no-print"
          style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
            >
              {copied ? 'Copied' : 'Copy Pass Text'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer size={14} />}
            >
              Print
            </Button>
          </div>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div
        className="printable-pass-document"
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Pass Official Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #102035 0%, #173252 100%)',
            color: '#FFFFFF',
            padding: '1.25rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
            borderBottom: '2px solid #2F8B8B',
          }}
        >
          {/* Official Property & Security Sub-header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#38BDF8',
              marginBottom: '0.375rem',
            }}
          >
            <Building2 size={13} />
            <span>AMS Community Services • Department of Security</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(52, 211, 153, 0.16)',
              color: '#6EE7B7',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              border: '1px solid rgba(52, 211, 153, 0.3)',
            }}
          >
            <ShieldCheck size={13} />
            <span>Official Gate Clearance Pass</span>
          </div>

          <h3
            style={{
              color: '#FFFFFF',
              fontSize: '1.45rem',
              fontWeight: 800,
              marginTop: '0.625rem',
              marginBottom: '0.2rem',
              letterSpacing: '-0.02em',
            }}
          >
            {visitor.visitorName}
          </h3>

          <div
            style={{
              fontSize: '0.8125rem',
              color: '#CBD5E1',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <span>Pass Ref: <strong style={{ color: '#38BDF8' }}>#VIS-{visitor.id}</strong></span>
            <span>•</span>
            <span>Unit: <strong style={{ color: '#FFFFFF' }}>{visitor.unitId}</strong></span>
          </div>
        </div>

        {/* Live Scannable High-Contrast QR Code Section */}
        <div
          style={{
            padding: '1.5rem 1.25rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px dashed #CBD5E1',
          }}
        >
          <div
            style={{
              padding: '0.875rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '2px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
              marginBottom: '0.75rem',
            }}
          >
            <QRCodeSVG
              value={qrDataText}
              size={160}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#102035"
              includeMargin={false}
            />
          </div>

          <VisitorStatusBadge status={visitor.status} size="md" />

          <div
            className="no-print"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              marginTop: '0.5rem',
              fontWeight: 500,
            }}
          >
            <Smartphone size={13} color="var(--color-accent)" />
            <span>Scan with any phone camera or gate terminal to authenticate</span>
          </div>
        </div>

        {/* Structured Clearance Details Ledger */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
            fontSize: '0.875rem',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <Home size={15} color="#2F8B8B" /> Destination Unit
            </span>
            <span style={{ fontWeight: 700, color: '#102035' }}>{visitor.unitId}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <User size={15} color="#2F8B8B" /> Host Resident
            </span>
            <span style={{ fontWeight: 600, color: '#1E293B' }}>{hostDisplayName}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <Calendar size={15} color="#2F8B8B" /> Scheduled Arrival Date
            </span>
            <span style={{ fontWeight: 600, color: '#1E293B' }}>{visitor.visitDate}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <Clock size={15} color="#2F8B8B" /> Visit Purpose
            </span>
            <span style={{ fontWeight: 600, color: '#1E293B' }}>{visitor.purpose}</span>
          </div>

          {/* Gate Verification Status */}
          {visitor.checkedInAt ? (
            <div
              style={{
                marginTop: '0.375rem',
                padding: '0.625rem 0.875rem',
                backgroundColor: '#ECFDF5',
                borderRadius: '8px',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: '#065F46',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} color="#059669" />
              <span>
                Gate Entrance Logged: {new Date(visitor.checkedInAt).toLocaleString()}
              </span>
            </div>
          ) : (
            /* Physical Checkpoint Sign-off Fields for Print */
            <div
              className="print-only"
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: '#334155',
              }}
            >
              <div style={{ fontWeight: 700, color: '#102035', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Security Checkpoint Sign-off
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.25rem' }}>
                <div style={{ flex: 1 }}>Time In: ___________________</div>
                <div style={{ flex: 1 }}>Vehicle Plate: ______________</div>
                <div style={{ flex: 1 }}>Officer Signature: ___________</div>
              </div>
            </div>
          )}

          {/* Official Community Notice */}
          <div
            style={{
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid #F1F5F9',
              fontSize: '0.6875rem',
              color: '#94A3B8',
              lineHeight: 1.4,
              textAlign: 'center',
            }}
          >
            Authorized entry under AMS Community Security By-laws. Valid only for the declared date and designated unit.
          </div>
        </div>
      </div>
    </Modal>
  );
};
