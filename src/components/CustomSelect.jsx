import React, { useState, useRef, useEffect, Children } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const CustomSelect = ({
  value,
  onChange,
  options: propOptions,
  children,
  placeholder = 'Select an option',
  className = '',
  triggerClassName = '',
  triggerStyle = {},
  id,
  name,
  disabled = false,
  required = false,
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Extract options from props OR child <option> tags
  const options = React.useMemo(() => {
    if (propOptions && Array.isArray(propOptions)) {
      return propOptions.map(opt => 
        typeof opt === 'object' && opt !== null 
          ? { value: opt.value, label: opt.label ?? opt.value }
          : { value: opt, label: String(opt) }
      );
    }

    if (children) {
      const extracted = [];
      Children.forEach(children, child => {
        if (React.isValidElement(child)) {
          extracted.push({
            value: child.props.value !== undefined ? child.props.value : child.props.children,
            label: child.props.children || child.props.value
          });
        }
      });
      return extracted;
    }

    return [];
  }, [propOptions, children]);

  // Find currently selected option
  const selectedOption = options.find(opt => String(opt.value) === String(value));

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optVal) => {
    if (disabled) return;
    if (onChange) {
      // Support both direct value callback and synthetic event
      onChange({
        target: {
          value: optVal,
          name: name || id
        }
      });
    }
    setIsOpen(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`syn-custom-select-container ${className}`}
      style={{ position: 'relative', width: triggerClassName ? 'auto' : '100%', display: triggerClassName ? 'inline-block' : 'block', ...style }}
    >
      {/* Hidden native input for form compatibility & validation */}
      <input 
        type="hidden" 
        id={id} 
        name={name} 
        value={value ?? ''} 
        required={required} 
      />

      {/* Select Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={triggerClassName ? `${triggerClassName} ${isOpen ? 'active' : ''}` : `form-control syn-select-trigger ${isOpen ? 'active' : ''}`}
        style={triggerClassName ? {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          backgroundImage: 'none',
          paddingRight: '0.65rem',
          ...triggerStyle
        } : {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderColor: isOpen ? 'var(--gold)' : undefined,
          boxShadow: isOpen ? '0 0 0 3px rgba(197, 137, 64, 0.2)' : undefined,
          backgroundColor: disabled ? 'var(--bg-canvas)' : '#FFFFFF',
          paddingRight: '0.85rem',
          userSelect: 'none',
          ...triggerStyle
        }}
      >
        <span 
          style={{ 
            color: triggerClassName ? 'inherit' : (selectedOption ? 'var(--text-main)' : 'var(--text-muted)'),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: triggerClassName ? 600 : 500,
            fontSize: triggerClassName ? '0.8rem' : undefined
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={triggerClassName ? 13 : 16} 
          color={triggerClassName ? 'currentColor' : (isOpen ? 'var(--primary)' : 'var(--gold)')} 
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            flexShrink: 0,
            marginLeft: triggerClassName ? '0.35rem' : '0.5rem'
          }}
        />
      </button>

      {/* Themed Dropdown Options Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="syn-select-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: triggerClassName ? '145px' : '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 14px 32px rgba(44, 32, 20, 0.16), 0 2px 8px rgba(44, 32, 20, 0.06)',
            zIndex: 500,
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '0.35rem',
            animation: 'synSelectFade 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {options.length > 0 ? (
            options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`syn-select-option ${isSelected ? 'selected' : ''}`}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-main)';
                    }
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check size={16} color="var(--primary)" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};
