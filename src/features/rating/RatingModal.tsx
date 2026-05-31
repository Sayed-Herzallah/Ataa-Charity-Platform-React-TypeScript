import { useState } from 'react';
import { ratingApi } from '../../services';

interface Props {
  donationId:   string;
  donationType?: string;
  charityName?:  string;
  onClose:  () => void;
  onSuccess: () => void;
}

const LABELS = ['', 'سيء 😞', 'مقبول 😐', 'جيد 🙂', 'جيد جداً 😊', 'ممتاز 🤩'];
const COLORS = ['', '#e53e3e', '#ed8936', '#ecc94b', '#48bb78', '#38a169'];

export default function RatingModal({ donationId, donationType, charityName, onClose, onSuccess }: Props) {
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError('يرجى اختيار تقييم'); return; }
    setError('');
    setLoading(true);
    try {
      await ratingApi.create(donationId, { rating, comment: comment.trim() || undefined });
      setDone(true);
      setTimeout(onSuccess, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setLoading(false);
    }
  };

  const active = hovered || rating;

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: 440 }}>
        <button className="modal-close" onClick={onClose}>×</button>

        {/* ─── Success ───────────────────────────────────── */}
        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🌟</div>
            <h2 className="modal-title" style={{ color: 'var(--teal-700)' }}>شكراً على تقييمك!</h2>
            <p className="modal-sub">رأيك يساعدنا في تحسين تجربة التبرع للجميع</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="verify-box">
              <div className="verify-icon">⭐</div>
              <h2 className="modal-title">قيّم تجربتك</h2>
              <p className="modal-sub">
                {donationType && charityName
                  ? <>تبرعك بـ <strong>"{donationType}"</strong> لـ <strong>{charityName}</strong></>
                  : donationType
                  ? <>تبرعك بـ <strong>"{donationType}"</strong></>
                  : 'كيف كانت تجربة التبرع؟'
                }
              </p>
            </div>

            {error && <div className="modal-error">{error}</div>}

            {/* Stars */}
            <div style={{ textAlign: 'center', margin: '20px 0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 38,
                      color: n <= active ? '#f6c90e' : 'var(--neutral-200)',
                      transform: n <= active ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all .15s',
                      lineHeight: 1,
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span style={{
                fontSize: 14, fontWeight: 700,
                color: COLORS[active] || 'transparent',
                display: 'block', minHeight: 22,
                transition: 'color .2s',
                visibility: active > 0 ? 'visible' : 'hidden'
              }}>
                {LABELS[active] || '\u00A0'}
              </span>
            </div>

            {/* Comment */}
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>
                تعليق إضافي
                <span style={{ color: 'var(--neutral-400)', fontWeight: 400, fontSize: 12, marginRight: 6 }}>(اختياري)</span>
              </label>
              <textarea
                className="rating-textarea"
                placeholder="شاركنا تجربتك مع الجمعية..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="button" className="btn-cancel" onClick={onClose} style={{ flex: 1 }}>
                لاحقًا
              </button>
              <button
                type="submit"
                className="btn-form"
                disabled={loading || !rating}
                style={{ flex: 2, opacity: !rating ? 0.5 : 1 }}
              >
                {loading
                  ? <><i className="fas fa-spinner fa-spin" style={{ marginLeft: 6 }} />جاري الإرسال...</>
                  : <><i className="fas fa-paper-plane" style={{ marginLeft: 6 }} />إرسال التقييم</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
