import React, { forwardRef, useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, id, required, style, disabled, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          </label>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: disabled ? 'var(--color-surface-sunken)' : 'var(--color-surface)',
            border: error
              ? '1.5px solid var(--color-danger)'
              : isFocused
              ? '1.5px solid var(--color-accent)'
              : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.75rem',
            boxShadow: isFocused ? '0 0 0 3px rgba(47, 139, 139, 0.15)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          {leftIcon && (
            <span style={{ marginRight: '0.5rem', color: 'var(--color-secondary)', display: 'inline-flex' }}>
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            required={required}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              width: '100%',
              ...style,
            }}
            {...props}
          />
          {rightIcon && (
            <span style={{ marginLeft: '0.5rem', color: 'var(--color-secondary)', display: 'inline-flex' }}>
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 500 }}>
            {error}
          </span>
        ) : helperText ? (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
