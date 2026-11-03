import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';

export default function ReviewsList({ professional }: { professional: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [avg, setAvg] = useState<number | null>(null);

  useEffect(() => {
    if (!professional) return;
    (async () => {
      try {
        const res = await fetchWithAuth(`/reviews/${encodeURIComponent(professional)}`);
        if (!res.ok) return;
        const data = await res.json();
        setReviews(data.reviews || []);
        setAvg(data.average || null);
      } catch (e) {
        // ignore
      }
    })();
  }, [professional]);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong>Reviews</strong>
        {avg !== null && <span style={{ color: '#f59e0b' }}>{avg.toFixed(1)}★</span>}
      </div>
      {reviews.length === 0 && <div style={{ color: '#64748b', marginTop: 8 }}>No reviews yet.</div>}
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
        {reviews.map((r) => (
          <li key={r.user + r.timestamp} style={{ padding: 8, borderRadius: 8, border: '1px solid #eef2ff', marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{r.user} <span style={{ color: '#f59e0b' }}>{r.rating}★</span></div>
            <div style={{ color: '#374151', marginTop: 6 }}>{r.comment}</div>
            <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 6 }}>{new Date(r.timestamp).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
