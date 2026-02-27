import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import { getAuthHeaders, fetchWithAuth } from '@/lib/api';

export default function ReviewForm({ professional }: { professional: string }) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(true);

  const token = localStorage.getItem('archifind_token');
  const me = token ? (jwt_decode(token).username || null) : null;

  useEffect(() => {
    (async () => {
      if (!professional) return;
      try {
        const res = await fetchWithAuth(`/reviews/${encodeURIComponent(professional)}`);
        const data = await res.json().catch(() => null);
        if (res.ok && data && Array.isArray(data.reviews)) {
          const already = data.reviews.find((r: any) => r.user === me);
          setCanReview(!already);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [professional]);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    setMessage(null);
    if (!professional) return setMessage('Invalid professional');
    setLoading(true);
    try {
      const res = await fetchWithAuth('/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professional, rating, comment }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(data?.message || 'Failed to submit review');
        return;
      }
      setMessage('Review submitted');
      setCanReview(false);
    } catch (e) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '12px 0' }}>
      <h4>Leave a review</h4>
      {!canReview && <div style={{ color: '#64748b' }}>You already reviewed this professional</div>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        {[1,2,3,4,5].map((n) => (
          <button key={n} onClick={() => setRating(n)} style={{ padding: 8, borderRadius: 6, border: rating===n ? '2px solid #2563eb' : '1px solid #e6edf3', background: rating===n ? '#eff6ff' : '#fff' }}>{n}★</button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment" style={{ width: '100%', minHeight: 80, marginTop: 8, padding: 8, borderRadius: 8, border: '1px solid #e6edf3' }} />
      {message && <div style={{ marginTop: 8, color: message.includes('submitted') ? '#16a34a' : '#ef4444' }}>{message}</div>}
      <div style={{ marginTop: 8 }}>
        <button onClick={submit} disabled={loading || !canReview} style={{ padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none' }}>{loading ? 'Submitting…' : 'Submit review'}</button>
      </div>
    </div>
  );
}
