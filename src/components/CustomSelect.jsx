import React, { useState, useRef, useEffect, Children } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuCoords, setMenuCoords] = useState(null);
  const containerRef = useRef(null);
  const menuRef = useRef(null);

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

  // Compute fixed positioning coordinates for portaled menu
  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // If trigger element has scrolled off screen, close dropdown
    if (rect.bottom < -20 || rect.top > window.innerHeight + 20 || rect.right < -20 || rect.left > window.innerWidth + 20) {
      setIsOpen(false);
      return;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedMenuHeight = Math.min(260, (options.length || 1) * 44 + 20);
    const openUp = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

    const minW = triggerClassName ? 150 : rect.width;
    let left = rect.left;
    if (left + minW > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - minW - 12);
    }

    setMenuCoords({
      top: openUp ? undefined : Math.round(rect.bottom + 4),
      bottom: openUp ? Math.round(window.innerHeight - rect.top + 4) : undefined,
      left: Math.max(8, Math.round(left)),
      width: Math.round(rect.width),
      minWidth: Math.round(minW)
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const estimatedMenuHeight = Math.min(260, (options.length || 1) * 44 + 20);
        const openUp = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

        const minW = triggerClassName ? 150 : rect.width;
        let left = rect.left;
        if (left + minW > window.innerWidth - 12) {
          left = Math.max(12, window.innerWidth - minW - 12);
        }

        setMenuCoords({
          top: openUp ? undefined : Math.round(rect.bottom + 4),
          bottom: openUp ? Math.round(window.innerHeight - rect.top + 4) : undefined,
          left: Math.max(8, Math.round(left)),
          width: Math.round(rect.width),
          minWidth: Math.round(minW)
        });
      }
    }
    setIsOpen(!isOpen);
  };

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
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

  // Recalculate menu position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, options.length]);

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
        onClick={handleToggle}
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
      {isOpen && menuCoords && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          className="syn-select-menu"
          style={{
            position: 'fixed',
            top: menuCoords.top !== undefined ? `${menuCoords.top}px` : undefined,
            bottom: menuCoords.bottom !== undefined ? `${menuCoords.bottom}px` : undefined,
            left: `${menuCoords.left}px`,
            minWidth: `${menuCoords.minWidth}px`,
            maxWidth: 'calc(100vw - 24px)',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 14px 32px rgba(44, 32, 20, 0.16), 0 2px 8px rgba(44, 32, 20, 0.06)',
            zIndex: 99999,
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
        </div>,
        document.body
      )}
    </div>
  );
};
