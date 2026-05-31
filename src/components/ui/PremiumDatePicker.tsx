import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

// ── Arabic Names Constants ──────────────────────────────────────────────────
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const DAYS_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const DAYS_AR_FULL = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDateString(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parseDateString(str: string): Date | null {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const date = new Date(y, m, d);
  return isNaN(date.getTime()) ? null : date;
}

// ═════════════════════════════════════════════════════════════════════════════
// PremiumDatePicker Component (Portal-Rendered & Mobile Modal Responsive)
// ═════════════════════════════════════════════════════════════════════════════
interface PremiumDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD
  placeholder?: string;
  className?: string;
  title?: string;
}

export function PremiumDatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = 'اختر التاريخ',
  className = '',
  title
}: PremiumDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedDate = useMemo(() => parseDateString(value), [value]);
  
  const [currentYear, setCurrentYear] = useState(() => selectedDate?.getFullYear() || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => selectedDate?.getMonth() || new Date().getMonth());

  // Check mobile viewport
  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth <= 767);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Sync state with selectedDate when value changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentYear(selectedDate.getFullYear());
      setCurrentMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  // Click outside listener for desktop absolute popup
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, isMobile]);

  // Dynamic positioning effect to measure actual dropdown height and eliminate gaps/offsets
  useEffect(() => {
    if (!isOpen || isMobile || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current && dropdownRef.current.offsetHeight > 100 ? dropdownRef.current.offsetHeight : 390;
      const dropdownWidth = dropdownRef.current && dropdownRef.current.offsetWidth > 100 ? dropdownRef.current.offsetWidth : 330;
      
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;
      const preferredLeft = rect.left + rect.width / 2 - dropdownWidth / 2 + window.scrollX;
      const leftPos = Math.max(8 + window.scrollX, Math.min(window.innerWidth - dropdownWidth - 8 + window.scrollX, preferredLeft));
      
      let topPos = openUpward 
        ? rect.top + window.scrollY - dropdownHeight - 4 
        : rect.bottom + window.scrollY + 4;
      
      // Clamp to ensure it doesn't go off-screen at the top
      topPos = Math.max(window.scrollY + 8, topPos);
      
      // Clamp to ensure it doesn't go off-screen at the bottom
      const maxTop = window.scrollY + window.innerHeight - dropdownHeight - 8;
      if (topPos > maxTop) {
        topPos = Math.max(window.scrollY + 8, maxTop);
      }

      setDropPos({
        top: topPos,
        left: leftPos,
        width: rect.width
      });
    };

    updatePosition();
    const rafId = requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, isMobile, currentYear, currentMonth]);

  // Calculate coordinates dynamically on desktop to escape parent overflow:hidden
  const handleTriggerClick = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 390; 
      const dropdownWidth = 330;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;
      const preferredLeft = rect.left + rect.width / 2 - dropdownWidth / 2 + window.scrollX;
      const leftPos = Math.max(8 + window.scrollX, Math.min(window.innerWidth - dropdownWidth - 8 + window.scrollX, preferredLeft));
      
      let topPos = openUpward 
        ? rect.top + window.scrollY - dropdownHeight - 4 
        : rect.bottom + window.scrollY + 4;
      
      // Clamp to ensure it doesn't go off-screen at the top
      topPos = Math.max(window.scrollY + 8, topPos);
      
      // Clamp to ensure it doesn't go off-screen at the bottom
      const maxTop = window.scrollY + window.innerHeight - dropdownHeight - 8;
      if (topPos > maxTop) {
        topPos = Math.max(window.scrollY + 8, maxTop);
      }

      setDropPos({
        top: topPos,
        left: leftPos,
        width: rect.width
      });
    }
    setIsOpen(prev => !prev);
  };

  // Generate calendar days grid
  const daysGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startIdx = firstDay.getDay(); // Day of the week of first day (0-6)
    
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevTotalDays = new Date(currentYear, currentMonth, 0).getDate();
    
    const grid: Array<{ day: number; monthOffset: number; dateStr: string; isToday: boolean; isSelected: boolean; isDisabled: boolean }> = [];
    
    const now = new Date();
    const todayStr = formatDateString(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 1. Previous month days (grayed out)
    for (let i = startIdx - 1; i >= 0; i--) {
      const prevDay = prevTotalDays - i;
      const mOffset = -1;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dStr = formatDateString(y, m, prevDay);
      grid.push({
        day: prevDay,
        monthOffset: mOffset,
        dateStr: dStr,
        isToday: dStr === todayStr,
        isSelected: value === dStr,
        isDisabled: (min && dStr < min) || (max && dStr > max) ? true : false
      });
    }
    
    // 2. Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dStr = formatDateString(currentYear, currentMonth, i);
      grid.push({
        day: i,
        monthOffset: 0,
        dateStr: dStr,
        isToday: dStr === todayStr,
        isSelected: value === dStr,
        isDisabled: (min && dStr < min) || (max && dStr > max) ? true : false
      });
    }
    
    // 3. Next month days (grayed out)
    const remainingSlots = 42 - grid.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const mOffset = 1;
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dStr = formatDateString(y, m, i);
      grid.push({
        day: i,
        monthOffset: mOffset,
        dateStr: dStr,
        isToday: dStr === todayStr,
        isSelected: value === dStr,
        isDisabled: (min && dStr < min) || (max && dStr > max) ? true : false
      });
    }
    
    return grid;
  }, [currentYear, currentMonth, value, min, max]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleDaySelect = (d: typeof daysGrid[0]) => {
    if (d.isDisabled) return;
    onChange(d.dateStr);
    setIsOpen(false);
  };

  const handleTodaySelect = () => {
    const now = new Date();
    const todayStr = formatDateString(now.getFullYear(), now.getMonth(), now.getDate());
    if ((min && todayStr < min) || (max && todayStr > max)) return;
    onChange(todayStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const displayValue = useMemo(() => {
    if (!selectedDate) return '';
    return `${selectedDate.getDate()} ${MONTHS_AR[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  }, [selectedDate]);

  // Calendar render structure
  const calendarContent = (
    <div 
      className={`pdp-dropdown ${isMobile ? 'pdp-mobile-dialog' : ''}`} 
      ref={dropdownRef} 
      style={isMobile ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100000,
        width: 'min(340px, calc(100vw - 32px))',
        background: '#0e131f', // SOLID opaque dark background
        border: '2px solid rgba(14, 201, 127, 0.3)',
        borderRadius: 24,
        padding: '24px 18px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 0 30px rgba(14, 201, 127, 0.15)',
        direction: 'rtl',
        animation: 'pdpFadeIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
      } : {
        position: 'absolute',
        top: dropPos ? dropPos.top : 0,
        left: dropPos ? Math.max(8, dropPos.left) : 0,
        zIndex: 99998,
        width: 330,
        background: '#0e131f', // SOLID opaque dark background
        border: '1.5px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 20,
        padding: 18,
        boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 20px rgba(14, 201, 127, 0.1)',
        direction: 'rtl',
        animation: 'pdpSlideIn 200ms cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    >
      {/* Header Month / Year Controls */}
      <div className="pdp-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18
      }}>
        <button 
          type="button" 
          className="pdp-nav-btn" 
          onClick={handleNextMonth} 
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <i className="ti ti-chevron-right" style={{ fontSize: 15 }} />
        </button>
        
        <div className="pdp-month-title" style={{ 
          fontWeight: 800, 
          color: '#fff', 
          fontSize: 16,
          fontFamily: "'Tajawal', sans-serif",
          letterSpacing: '0.3px',
          whiteSpace: 'nowrap'
        }}>
          {MONTHS_AR[currentMonth]} {currentYear}
        </div>
        
        <button 
          type="button" 
          className="pdp-nav-btn" 
          onClick={handlePrevMonth}
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <i className="ti ti-chevron-left" style={{ fontSize: 15 }} />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="pdp-days-header" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        textAlign: 'center',
        marginBottom: 12,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 8
      }}>
        {DAYS_AR.map((day, idx) => (
          <span key={idx} style={{ 
            fontSize: 13, 
            fontWeight: 800, 
            color: 'rgba(255,255,255,0.4)', 
            display: 'flex', 
            justifyContent: 'center',
            fontFamily: "'Tajawal', sans-serif"
          }} title={DAYS_AR_FULL[idx]}>
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="pdp-days-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 6
      }}>
        {daysGrid.map((cell, idx) => {
          let cellBg = 'transparent';
          let cellColor = 'rgba(255,255,255,0.85)';
          let border = '1px solid transparent';
          
          if (cell.monthOffset !== 0) {
            cellColor = 'rgba(255,255,255,0.2)'; // Out of month
          }
          if (cell.isToday) {
            border = '1.5px solid #0ec97f';
            cellColor = '#0ec97f';
          }
          if (cell.isSelected) {
            cellBg = '#0ec97f';
            cellColor = '#fff';
            border = '1px solid transparent';
          }
          
          return (
            <button
              key={idx}
              type="button"
              disabled={cell.isDisabled}
              onClick={() => handleDaySelect(cell)}
              style={{
                height: 38,
                width: '100%',
                borderRadius: 10,
                background: cellBg,
                border: border,
                color: cellColor,
                fontSize: 13.5,
                fontFamily: "'Tajawal', sans-serif",
                fontWeight: cell.isSelected || cell.isToday ? 800 : 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: cell.isDisabled ? 'not-allowed' : 'pointer',
                opacity: cell.isDisabled ? 0.15 : 1,
                transition: 'all 0.15s ease'
              }}
              className="pdp-day-btn"
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Footer Controls */}
      <div className="pdp-footer" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginTop: 16,
        paddingTop: 14
      }}>
        <button
          type="button"
          onClick={handleTodaySelect}
          style={{
            background: 'rgba(14, 201, 127, 0.1)', 
            border: 'none',
            borderRadius: 8,
            padding: '6px 14px',
            color: '#0ec97f',
            fontSize: 13, 
            fontWeight: 800,
            fontFamily: "'Tajawal', sans-serif",
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          className="pdp-footer-btn"
        >
          اليوم
        </button>
        
        <button
          type="button"
          onClick={handleClear}
          style={{
            background: 'rgba(240, 72, 112, 0.1)', 
            border: 'none',
            borderRadius: 8,
            padding: '6px 14px',
            color: '#f04870',
            fontSize: 13, 
            fontWeight: 800,
            fontFamily: "'Tajawal', sans-serif",
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          className="pdp-footer-btn"
        >
          مسح
        </button>
      </div>
    </div>
  );

  return (
    <div className={`pdp-container ${className}`} style={{ position: 'relative', width: '100%' }}>
      {/* Target input field */}
      <div 
        ref={triggerRef}
        className={`pdp-input-wrap ${isOpen ? 'pdp-active' : ''}`}
        onClick={handleTriggerClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        title={title}
      >
        <span className="pdp-input-text" style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {displayValue || placeholder}
        </span>
        <i className="ti ti-calendar" style={{ fontSize: 16, color: '#0ec97f' }} />
      </div>

      {/* Render via Portal so it escapes parent container overflow cuts */}
      {isOpen && createPortal(
        <>
          {/* Backdrop Overlay to capture click outside and cover screens - ONLY ON MOBILE */}
          {isMobile && (
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99990,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(10px)',
                transition: 'opacity 0.25s'
              }}
              onClick={() => setIsOpen(false)}
            />
          )}
          {calendarContent}
        </>,
        document.body
      )}

      {/* Styled animation keyframes inside style tag */}
      <style>{`
        .pdp-input-wrap {
          background: #161b26;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 13.5px;
          color: #f1f5f9;
          font-family: 'Tajawal', sans-serif;
          font-weight: 700;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .pdp-input-wrap:hover {
          border-color: #0ec97f;
          background: #0f131a;
          box-shadow: 0 4px 20px rgba(14, 201, 127, 0.15);
        }
        .pdp-input-wrap.pdp-active {
          border-color: #0ec97f;
          background: #0f131a;
          box-shadow: 0 0 0 3px rgba(14, 201, 127, 0.25);
        }
        .ap-light-theme .pdp-input-wrap {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #1e293b;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .ap-light-theme .pdp-input-wrap:hover {
          background: #ffffff;
          border-color: #065f46;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
        }
        .ap-light-theme .pdp-input-wrap.pdp-active {
          background: #ffffff;
          border-color: #065f46;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
        
        /* Opaque popup light theme overrides */
        .ap-light-theme .pdp-dropdown {
          background: #ffffff !important;
          border: 1.5px solid #e2e8f0 !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.12), 0 0 15px rgba(0,0,0,0.02) !important;
        }
        .ap-light-theme .pdp-month-title {
          color: #1e293b !important;
        }
        .ap-light-theme .pdp-nav-btn {
          background: #f1f5f9 !important;
          border: 1px solid #e2e8f0 !important;
          color: #1e293b !important;
        }
        .ap-light-theme .pdp-days-header {
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .ap-light-theme .pdp-days-header span {
          color: #64748b !important;
        }
        .ap-light-theme .pdp-day-btn {
          color: #334155 !important;
        }
        .ap-light-theme .pdp-day-btn:disabled {
          color: #cbd5e1 !important;
        }
        .ap-light-theme .pdp-footer {
          border-top: 1px solid #e2e8f0 !important;
        }
        .ap-light-theme .pdp-footer-btn {
          background: #f1f5f9 !important;
          color: #0f766e !important;
        }
        .ap-light-theme .pdp-day-btn[style*="background: rgb(14, 201, 127)"] {
          color: #fff !important;
        }
        
        .pdp-day-btn:hover:not(:disabled) {
          background: rgba(14, 201, 127, 0.15) !important;
          color: #0ec97f !important;
          transform: scale(1.08);
        }
        .pdp-day-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        .pdp-footer-btn:hover {
          filter: brightness(1.15);
          transform: translateY(-1px);
        }
        .pdp-footer-btn:active {
          transform: translateY(0);
        }
        
        @keyframes pdpSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pdpFadeIn {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PremiumTimePicker Component (Portal-Rendered & Clean Grid Interface)
// ═════════════════════════════════════════════════════════════════════════════
interface PremiumTimePickerProps {
  value: string; // HH:MM (24h)
  onChange: (val: string) => void;
  className?: string;
  title?: string;
}

export function PremiumTimePicker({
  value,
  onChange,
  className = '',
  title
}: PremiumTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check mobile viewport
  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth <= 767);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Parse time
  const [hour, minute] = useMemo(() => {
    if (!value) return [12, 0];
    const parts = value.split(':');
    return [parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0];
  }, [value]);

  // Click outside listener for desktop
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, isMobile]);

  // Dynamic positioning effect for time picker
  useEffect(() => {
    if (!isOpen || isMobile || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current && dropdownRef.current.offsetHeight > 100 ? dropdownRef.current.offsetHeight : 310;
      const dropdownWidth = dropdownRef.current && dropdownRef.current.offsetWidth > 100 ? dropdownRef.current.offsetWidth : 270;
      
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;
      const preferredLeft = rect.left + rect.width / 2 - dropdownWidth / 2 + window.scrollX;
      const leftPos = Math.max(8 + window.scrollX, Math.min(window.innerWidth - dropdownWidth - 8 + window.scrollX, preferredLeft));
      
      let topPos = openUpward 
        ? rect.top + window.scrollY - dropdownHeight - 4 
        : rect.bottom + window.scrollY + 4;
      
      // Clamp to ensure it doesn't go off-screen at the top
      topPos = Math.max(window.scrollY + 8, topPos);
      
      // Clamp to ensure it doesn't go off-screen at the bottom
      const maxTop = window.scrollY + window.innerHeight - dropdownHeight - 8;
      if (topPos > maxTop) {
        topPos = Math.max(window.scrollY + 8, maxTop);
      }

      setDropPos({
        top: topPos,
        left: leftPos,
        width: rect.width
      });
    };

    updatePosition();
    const rafId = requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, isMobile]);

  // Calculate coordinates dynamically on desktop to escape parent overflow:hidden
  const handleTriggerClick = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 310; 
      const dropdownWidth = 270;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;
      const preferredLeft = rect.left + rect.width / 2 - dropdownWidth / 2 + window.scrollX;
      const leftPos = Math.max(8 + window.scrollX, Math.min(window.innerWidth - dropdownWidth - 8 + window.scrollX, preferredLeft));
      
      let topPos = openUpward 
        ? rect.top + window.scrollY - dropdownHeight - 4 
        : rect.bottom + window.scrollY + 4;
      
      // Clamp to ensure it doesn't go off-screen at the top
      topPos = Math.max(window.scrollY + 8, topPos);
      
      // Clamp to ensure it doesn't go off-screen at the bottom
      const maxTop = window.scrollY + window.innerHeight - dropdownHeight - 8;
      if (topPos > maxTop) {
        topPos = Math.max(window.scrollY + 8, maxTop);
      }

      setDropPos({
        top: topPos,
        left: leftPos,
        width: rect.width
      });
    }
    setIsOpen(prev => !prev);
  };

  const handleHourClick = (h12: number) => {
    const isPM = hour >= 12;
    let newH = h12 % 12;
    if (isPM) newH += 12;
    const formattedHour = String(newH).padStart(2, '0');
    const formattedMin = String(minute).padStart(2, '0');
    onChange(`${formattedHour}:${formattedMin}`);
  };

  const handleMinuteClick = (m: number) => {
    const formattedHour = String(hour).padStart(2, '0');
    const formattedMin = String(m).padStart(2, '0');
    onChange(`${formattedHour}:${formattedMin}`);
  };

  const togglePeriod = (p: 'ص' | 'م') => {
    let newH = hour % 12;
    if (p === 'م') newH += 12;
    const formattedHour = String(newH).padStart(2, '0');
    const formattedMin = String(minute).padStart(2, '0');
    onChange(`${formattedHour}:${formattedMin}`);
  };

  // Convert to 12h format for display only
  const displayValue = useMemo(() => {
    if (!value) return 'اختر الوقت';
    const h12 = hour % 12 || 12;
    const period = hour >= 12 ? 'م' : 'ص';
    const mStr = String(minute).padStart(2, '0');
    return `${h12}:${mStr} ${period}`;
  }, [value, hour, minute]);

  // Grid time picker layout (Scroll-free, extremely clean!)
  const timeContent = (
    <div 
      className={`ptp-dropdown ${isMobile ? 'ptp-mobile-dialog' : ''}`} 
      ref={dropdownRef} 
      style={isMobile ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100000,
        width: 'min(300px, calc(100vw - 32px))',
        background: '#0e131f', // SOLID opaque dark background
        border: '2px solid rgba(14, 201, 127, 0.3)',
        borderRadius: 24,
        padding: 22,
        boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 0 30px rgba(14, 201, 127, 0.15)',
        direction: 'rtl',
        animation: 'pdpFadeIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
      } : {
        position: 'absolute',
        top: dropPos ? dropPos.top : 0,
        left: dropPos ? Math.max(8, dropPos.left) : 0,
        zIndex: 99998,
        width: 270,
        background: '#0e131f', // SOLID opaque dark background
        border: '1.5px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 20,
        padding: 18,
        boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 20px rgba(14, 201, 127, 0.1)',
        direction: 'rtl',
        animation: 'pdpSlideIn 200ms cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    >
      {/* AM/PM Toggle */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, marginBottom: 16 }}>
        <button 
          type="button" 
          onClick={() => togglePeriod('ص')}
          style={{
            flex: 1, padding: '7px 0', border: 'none', borderRadius: 9,
            background: hour < 12 ? '#0ec97f' : 'transparent',
            color: hour < 12 ? '#fff' : 'rgba(255,255,255,0.4)',
            fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: "'Tajawal', sans-serif"
          }}
        >
          صباحاً (ص)
        </button>
        <button 
          type="button" 
          onClick={() => togglePeriod('م')}
          style={{
            flex: 1, padding: '7px 0', border: 'none', borderRadius: 9,
            background: hour >= 12 ? '#0ec97f' : 'transparent',
            color: hour >= 12 ? '#fff' : 'rgba(255,255,255,0.4)',
            fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: "'Tajawal', sans-serif"
          }}
        >
          مساءً (م)
        </button>
      </div>

      {/* Select Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Hour Grid (12h system) */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 8, marginRight: 2, fontFamily: "'Tajawal', sans-serif" }}>الساعة</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {Array.from({ length: 12 }).map((_, idx) => {
              const h = idx + 1;
              const isSelected = (hour % 12 || 12) === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourClick(h)}
                  style={{
                    height: 34, borderRadius: 8,
                    background: isSelected ? '#0ec97f' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                    fontSize: 12.5, fontWeight: isSelected ? 800 : 500,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    fontFamily: "'Tajawal', sans-serif"
                  }}
                  className="ptp-grid-btn"
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>

        {/* Minute Grid */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 8, marginRight: 2, fontFamily: "'Tajawal', sans-serif" }}>الدقيقة</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => {
              const isSelected = minute === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteClick(m)}
                  style={{
                    height: 34, borderRadius: 8,
                    background: isSelected ? '#0ec97f' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                    fontSize: 12.5, fontWeight: isSelected ? 800 : 500,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    fontFamily: "'Tajawal', sans-serif"
                  }}
                  className="ptp-grid-btn"
                >
                  {String(m).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginTop: 16,
        paddingTop: 14,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 12,
            background: '#0ec97f',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 800,
            fontFamily: "'Tajawal', sans-serif",
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(14, 201, 127, 0.3)',
            transition: 'all 0.2s'
          }}
          className="ptp-confirm-btn"
        >
          تأكيد الوقت
        </button>
      </div>
    </div>
  );

  return (
    <div className={`ptp-container ${className}`} style={{ position: 'relative', width: '100%' }}>
      {/* Target input field */}
      <div 
        ref={triggerRef}
        className={`ptp-input-wrap ${isOpen ? 'ptp-active' : ''}`}
        onClick={handleTriggerClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        title={title}
      >
        <span className="ptp-input-text" style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {displayValue}
        </span>
        <i className="ti ti-clock" style={{ fontSize: 16, color: '#0ec97f' }} />
      </div>

      {/* Render via Portal so it escapes parent container overflow cuts */}
      {isOpen && createPortal(
        <>
          {/* Backdrop Overlay to capture click outside and cover screens - ONLY ON MOBILE */}
          {isMobile && (
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99990,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(10px)',
                transition: 'opacity 0.25s'
              }}
              onClick={() => setIsOpen(false)}
            />
          )}
          {timeContent}
        </>,
        document.body
      )}

      {/* Styled animation keyframes inside style tag */}
      <style>{`
        .ptp-input-wrap {
          background: #161b26;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 13.5px;
          color: #f1f5f9;
          font-family: 'Tajawal', sans-serif;
          font-weight: 700;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .ptp-input-wrap:hover {
          border-color: #0ec97f;
          background: #0f131a;
          box-shadow: 0 4px 20px rgba(14, 201, 127, 0.15);
        }
        .ptp-input-wrap.ptp-active {
          border-color: #0ec97f;
          background: #0f131a;
          box-shadow: 0 0 0 3px rgba(14, 201, 127, 0.25);
        }
        .ap-light-theme .ptp-input-wrap {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #1e293b;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .ap-light-theme .ptp-input-wrap:hover {
          background: #ffffff;
          border-color: #065f46;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
        }
        .ap-light-theme .ptp-input-wrap.ptp-active {
          background: #ffffff;
          border-color: #065f46;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
        
        /* Opaque popup light theme overrides */
        .ap-light-theme .ptp-dropdown {
          background: #ffffff !important;
          border: 1.5px solid #e2e8f0 !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.12), 0 0 15px rgba(0,0,0,0.02) !important;
        }
        .ap-light-theme .ptp-dropdown label,
        .ap-light-theme .ptp-dropdown div[style*="color: rgba(255, 255, 255, 0.4)"] {
          color: #64748b !important;
        }
        .ap-light-theme .ptp-grid-btn {
          background: #f1f5f9 !important;
          border: 1px solid #e2e8f0 !important;
          color: #334155 !important;
        }
        .ap-light-theme .ptp-grid-btn[style*="background: rgb(14, 201, 127)"] {
          background: #0ec97f !important;
          color: #fff !important;
          border-color: transparent !important;
        }
        .ap-light-theme .ptp-dropdown div[style*="background: rgba(255, 255, 255, 0.06)"] {
          background: #f1f5f9 !important;
        }
        .ap-light-theme .ptp-dropdown button[style*="color: rgba(255, 255, 255, 0.4)"] {
          color: #64748b !important;
        }
        .ap-light-theme .ptp-dropdown button[style*="background: rgb(14, 201, 127)"] {
          background: #0ec97f !important;
          color: #fff !important;
        }
        .ap-light-theme .ptp-confirm-btn {
          background: #0ec97f !important;
          color: #fff !important;
        }
        
        .ptp-grid-btn:hover {
          background: rgba(14, 201, 127, 0.15) !important;
          color: #0ec97f !important;
          transform: scale(1.08);
        }
        .ptp-grid-btn:active {
          transform: scale(0.95);
        }
        .ptp-confirm-btn:hover {
          filter: brightness(1.1);
          box-shadow: 0 6px 16px rgba(14, 201, 127, 0.4);
          transform: translateY(-1px);
        }
        .ptp-confirm-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
