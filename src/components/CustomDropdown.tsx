'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CustomDropdownProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options?: string[]; // For simple flat lists (like Core sections)
  groupedOptions?: Record<string, string[]>; // For grouped electives (like PE-1 and PE-2)
  formatLabel: (val: string) => string;
}

export default function CustomDropdown({
  label,
  placeholder,
  value,
  onChange,
  options,
  groupedOptions,
  formatLabel,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When value changes, auto-expand the parent group of the selected value so it's visible when opened
  useEffect(() => {
    if (value && groupedOptions) {
      for (const groupName of Object.keys(groupedOptions)) {
        if (groupedOptions[groupName].includes(value)) {
          setExpandedGroups(prev => ({ ...prev, [groupName]: true }));
          break;
        }
      }
    }
  }, [value, groupedOptions]);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleOptionClick = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
  };

  const toggleGroup = (e: React.MouseEvent, groupName: string) => {
    e.stopPropagation(); // Avoid closing the dropdown when clicking the group header
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <div className="custom-dropdown-container" ref={containerRef}>
      <label className="select-group-label" style={{ fontSize: '0.85rem', fontWeight: 600, transform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
        {label}
      </label>
      
      <div 
        onClick={toggleDropdown} 
        className="custom-dropdown-trigger"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value ? formatLabel(value) : placeholder}
        </span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s',
            color: 'var(--accent-cyan)'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {isOpen && (
        <div className="custom-dropdown-menu">
          {/* Simple flat list mapping (e.g. Core sections) */}
          {options && options.map(opt => (
            <div 
              key={opt} 
              onClick={() => handleOptionClick(opt)}
              className="custom-dropdown-item"
              style={{
                background: value === opt ? 'var(--primary-glow)' : 'transparent',
                fontWeight: value === opt ? '700' : 'normal'
              }}
            >
              {formatLabel(opt)}
            </div>
          ))}

          {/* Grouped lists with inline expander accordions (PE-1 and PE-2 electives) */}
          {groupedOptions && Object.keys(groupedOptions).sort().map(groupName => {
            const isExpanded = !!expandedGroups[groupName];
            return (
              <div key={groupName} style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  onClick={(e) => toggleGroup(e, groupName)}
                  className="custom-dropdown-group-header"
                >
                  <span>{groupName}</span>
                  <svg 
                    width="10" 
                    height="10" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    style={{ 
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(-90deg)', 
                      transition: 'transform 0.2s',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                
                {isExpanded && (
                  <div className="custom-dropdown-sub-items">
                    {groupedOptions[groupName].map(opt => (
                      <div 
                        key={opt}
                        onClick={() => handleOptionClick(opt)}
                        className="custom-dropdown-sub-item"
                        style={{
                          background: value === opt ? 'var(--primary-glow)' : 'transparent',
                          fontWeight: value === opt ? '700' : 'normal'
                        }}
                      >
                        {formatLabel(opt)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
