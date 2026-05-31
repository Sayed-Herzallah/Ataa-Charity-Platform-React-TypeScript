import React, { useEffect } from 'react';
import { Link } from 'wouter';
import DonationForm from './DonationForm';
import '../../styles/css/DonationModal.css';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DonationModal({ isOpen, onClose, onSuccess }: DonationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay open"
      style={{ zIndex: 9000 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-box"
        style={{ maxWidth: 680, width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)'
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>إضافة تبرع جديد</h2>
          <button
            className="modal-close"
            onClick={onClose}
            style={{ position: 'static', color: 'var(--t1)' }}
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>
        <div style={{ padding: '24px', background: 'var(--surface)' }}>
          <DonationForm onSuccess={onSuccess} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}

export function DonationPage(): JSX.Element {
  /* متزامن 100% مع خيار المستخدم للثيم الداكن/الفاتح */
  useEffect(() => {
    try {
      const isDark = (localStorage.getItem('ap-theme') || 'dark') === 'dark';
      document.body.classList.toggle('ap-light-theme', !isDark);
    } catch {}
    return () => {
      document.body.classList.remove('ap-light-theme');
    };
  }, []);

  return (
    <div className="donation-page-container">
      <div className="donation-page-inner">
        
        {/* Header Section */}
        <div className="donation-page-head">
          <div>
            <h2 className="dp-title">
              <i className="ti ti-gift" />
              إضافة تبرع جديد
            </h2>
            <p className="dp-sub">
              ساهم في نشر الخير ومساعدة الآخرين من خلال أغراضك بحالة جيدة
            </p>
          </div>
          <Link href="/user-dashboard">
            <button
              className="ap-action-btn edit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />
              العودة للوحة التحكم
            </button>
          </Link>
        </div>

        {/* Form Card wrapper with glassmorphic styles */}
        <div className="donation-page-card">
          <DonationForm />
        </div>

      </div>
    </div>
  );
}