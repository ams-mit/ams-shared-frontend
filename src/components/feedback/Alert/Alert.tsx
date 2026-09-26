import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  style?: React.CSSProperties;
  autoDismiss?: boolean;
  autoDismissDuration?: number; // duration in ms, defaults to 5000ms (5 seconds)
  showDismissButton?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onDismiss,
  style,
  autoDismiss = true,
  autoDismissDuration = 5000,
  showDismissButton = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(autoDismissDuration);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 320);
  };

  useEffect(() => {
    if (!autoDismiss) return;

    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingTimeRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoDismiss, isPaused]);

  const handleMouseEnter = () => {
    if (!autoDismiss) return;
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (!autoDismiss) return;
    if (remainingTimeRef.current > 0) {
      setIsPaused(false);
    }
  };

  if (!isVisible) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--color-success-bg)',
          border: 'var(--color-success-border)',
          color: 'var(--color-success-text)',
          progressColor: 'var(--color-success)',
          icon: <CheckCircle2 size={18} color="var(--color-success)" />,
        };
      case 'warning':
        return {
          bg: 'var(--color-warning-bg)',
          border: 'var(--color-warning-border)',
          color: 'var(--color-warning-text)',
          progressColor: 'var(--color-warning)',
          icon: <AlertTriangle size={18} color="var(--color-warning)" />,
        };
      case 'error':
        return {
          bg: 'var(--color-danger-bg)',
          border: 'var(--color-danger-border)',
          color: 'var(--color-danger-text)',
          progressColor: 'var(--color-danger)',
          icon: <AlertCircle size={18} color="var(--color-danger)" />,
        };
      case 'info':
      default:
        return {
          bg: 'var(--color-info-bg)',
          border: 'var(--color-info-border)',
          color: 'var(--color-info-text)',
          progressColor: 'var(--color-info)',
          icon: <Info size={18} color="var(--color-info)" />,
        };
    }
  };

  const config = getConfig();

  return (
    <div
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: isExiting ? '0 1.25rem' : '0.875rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: config.bg,
        border: isExiting ? 'none' : `1px solid ${config.border}`,
        color: config.color,
        fontSize: '0.875rem',
        boxShadow: isExiting ? 'none' : 'var(--shadow-xs)',
        overflow: 'hidden',
        maxHeight: isExiting ? 0 : '300px',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateY(-6px) scale(0.98)' : 'translateY(0) scale(1)',
        marginBottom: isExiting ? 0 : undefined,
        transition: 'all 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{config.icon}</div>
      <div style={{ flex: 1, paddingBottom: autoDismiss ? '4px' : 0 }}>
        {title && <div style={{ fontWeight: 700, marginBottom: '0.125rem' }}>{title}</div>}
        <div style={{ lineHeight: 1.45 }}>{message}</div>
      </div>
      {showDismissButton && (
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Dismiss alert"
          title="Dismiss notification"
          style={{
            color: 'inherit',
            opacity: 0.7,
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity var(--transition-fast)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          <X size={16} />
        </button>
      )}

      {/* Auto-dismiss subtle progress countdown bar */}
      {autoDismiss && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: config.progressColor,
              width: '100%',
              transformOrigin: 'left',
              animation: `alertCountdown ${autoDismissDuration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
};

