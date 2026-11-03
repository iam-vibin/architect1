import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function getAuthHeaders() {
  const token = localStorage.getItem('archifind_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function PortfolioView() {
  const { username } = useParams();
  const [images, setImages] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await fetch(`/portfolio/${encodeURIComponent(username)}`, { headers: { ...getAuthHeaders() } });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.images) setImages(data.images);
    } catch (e) {
      console.error('load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [username]);

  return (
    <div style={{ maxWidth: 980, margin: '16px auto', padding: 12 }}>
      <h3>{username}'s Portfolio</h3>
      {loading && <div>Loading…</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {images.map((img, i) => (
          <div key={i} style={{ borderRadius: 8, overflow: 'hidden', background: '#f8fafc' }}>
            <img src={img.imageUrl} alt={`img-${i}`} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
            <div style={{ padding: 8, fontSize: 12, color: '#475569' }}>{new Date(img.uploadedAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
