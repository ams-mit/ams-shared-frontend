import React, { forwardRef, useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search, MapPin } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string; name?: string } }) => void;
  searchable?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder = 'Select an option...',
      id,
      name,
      required,
      style,
      disabled,
      value,
      onChange,
      searchable,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    // Find the currently selected option
    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    // Enable search automatically if list has 5 or more items unless explicitly disabled
    const showSearch = searchable ?? (options.length >= 5);

    // Filter options based on search query
    const filteredOptions = options.filter((opt) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        opt.label.toLowerCase().includes(term) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(term))
      );
    });

    // Close on click outside
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleOutsideClick);
      }
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && showSearch && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
      if (isOpen) {
        const idx = filteredOptions.findIndex((opt) => String(opt.value) === String(value));
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
    }, [isOpen]);

    const handleSelect = (option: SelectOption) => {
      if (disabled) return;
      if (onChange) {
        const syntheticEvent = {
          target: { value: String(option.value), name: name || '' },
          currentTarget: { value: String(option.value), name: name || '' },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
      setIsOpen(false);
      setSearchTerm('');
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
      }
    };

    // Helper to parse title and location subtitle from labels formatted like "Name (Location)"
    const parseLabel = (labelStr: string, optSubLabel?: string) => {
      if (optSubLabel) {
        return { title: labelStr, sub: optSubLabel };
      }
      const match = labelStr.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        return { title: match[1].trim(), sub: match[2].trim() };
      }
      return { title: labelStr, sub: null };
    };

    const selectedParsed = selectedOption
      ? parseLabel(selectedOption.label, selectedOption.subLabel)
      : null;

    return (
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
          width: '100%',
          position: 'relative',
          ...style,
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Label */}
        {label && (
          <label
            id={`${selectId}-label`}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              userSelect: 'none',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          </label>
        )}

        {/* Hidden native select for accessibility & form serialization */}
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value ?? ''}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          readOnly
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Premium Trigger Button */}
        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          style={{
            width: '100%',
            minHeight: '44px',
            padding: '0.5rem 0.875rem',
            backgroundColor: disabled ? '#F3F4F6' : '#FFFFFF',
            border: error
              ? '1.5px solid var(--color-danger)'
              : isOpen
              ? '1.5px solid var(--color-accent)'
              : '1px solid #D1D5DB',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            boxShadow: isOpen
              ? '0 0 0 3px rgba(47, 139, 139, 0.16)'
              : '0 1px 2px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.18s ease-in-out',
            outline: 'none',
          }}
        >
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            {selectedOption ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedOption.icon && (
                  <span style={{ display: 'inline-flex', color: 'var(--color-accent)' }}>
                    {selectedOption.icon}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', overflow: 'hidden' }}>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {selectedParsed?.title}
                  </span>
                  {selectedParsed?.sub && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748B',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      ({selectedParsed.sub})
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '0.875rem', color: '#94A3B8' }}>{placeholder}</span>
            )}
          </div>

          <ChevronDown
            size={18}
            style={{
              color: isOpen ? 'var(--color-accent)' : '#64748B',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.18s ease',
              flexShrink: 0,
            }}
          />
        </button>

        {/* Dropdown Floating Panel */}
        {isOpen && (
          <div
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.16), 0 4px 10px rgba(15, 23, 42, 0.06)',
              zIndex: 1050,
              overflow: 'hidden',
              animation: 'dropdownFadeIn 0.16s ease-out',
            }}
          >
            {/* Optional Search / Filter */}
            {showSearch && (
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid #F1F5F9',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Search size={15} color="#94A3B8" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.8125rem',
                    color: '#0F172A',
                    width: '100%',
                  }}
                />
              </div>
            )}

            {/* Options List */}
            <div
              style={{
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '0.375rem',
              }}
            >
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    fontSize: '0.8125rem',
                    color: '#94A3B8',
                  }}
                >
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value);
                  const isHighlighted = idx === highlightedIndex;
                  const parsed = parseLabel(opt.label, opt.subLabel);

                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => handleSelect(opt)}
                      style={{
                        padding: '0.625rem 0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        backgroundColor: isSelected
                          ? 'rgba(47, 139, 139, 0.08)'
                          : isHighlighted
                          ? '#F8FAFC'
                          : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--color-accent)' : '3px solid transparent',
                        transition: 'background-color 0.12s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                        {opt.icon && (
                          <div style={{ marginTop: '2px', color: isSelected ? 'var(--color-accent)' : '#64748B' }}>
                            {opt.icon}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected ? '#0F766E' : '#1E293B',
                              lineHeight: 1.3,
                            }}
                          >
                            {parsed.title}
                          </span>
                          {parsed.sub && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#64748B',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                lineHeight: 1.2,
                              }}
                            >
                              <MapPin size={11} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {parsed.sub}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Selected Checkmark or Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {opt.badge && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              backgroundColor: '#E2E8F0',
                              color: '#334155',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '4px',
                            }}
                          >
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check size={16} color="var(--color-accent)" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Error or Helper text */}
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

Select.displayName = 'Select';
