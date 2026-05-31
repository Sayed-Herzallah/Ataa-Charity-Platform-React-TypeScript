import React, { useEffect, useState } from 'react';
import { donorApi, Donation } from '../../services';
import { statusLabel, formatDate } from '../../lib/utils';

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    donorApi
      .getMyDonations()
      .then(res => setDonations(res.donations || res.Data || []))
      .catch(err => setError(err?.message || 'حدث خطأ أثناء تحميل التبرعات'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="spinner" style={{ padding: 60 }}>
        <div className="spinner-ring" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-error" style={{ margin: 40, padding: 20, borderRadius: 10 }}>
        <i className="fas fa-exclamation-triangle" style={{ marginLeft: 8 }} />
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>تبرعاتي</h2>
      {donations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>لا توجد تبرعات حتى الآن</p>
        </div>
      ) : (
        <div className="donations-list">
          {donations.map(d => {
            const { label, cls } = statusLabel(d.status);
            return (
              <div key={d._id} className="donation-item">
                <div className="donation-icon">👕</div>
                <div className="donation-info">
                  <h4>{d.type} — {d.size}</h4>
                  <p>{d.quantity} قطعة | {d.condition} | {formatDate(d.createdAt)}</p>
                </div>
                <span className={`donation-status status-badge ${cls}`}>{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
