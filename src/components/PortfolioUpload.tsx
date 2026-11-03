import React, { useState } from 'react';

function getAuthHeaders() {
  const token = localStorage.getItem('archifind_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function PortfolioUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onFile = (f: File | null) => {
    setMessage(null);
    setFile(f);
    if (!f) return setPreview(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const upload = async () => {
    if (!file) return setMessage('Please select an image');
    setLoading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch('/portfolio/upload', {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: form,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(data?.message || 'Upload failed');
        return;
      }
      setMessage('Upload successful');
      setFile(null);
      setPreview(null);
    } catch (e) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '16px auto', padding: 12 }}>
      <h3>Upload Portfolio Image</h3>
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files ? e.target.files[0] : null)} />
      {preview && <div style={{ marginTop: 12 }}><img src={preview} alt="preview" style={{ maxWidth: '100%', borderRadius: 8 }} /></div>}
      {message && <div style={{ marginTop: 8, color: message.includes('success') ? '#16a34a' : '#ef4444' }}>{message}</div>}
      <div style={{ marginTop: 12 }}>
        <button onClick={upload} disabled={loading} style={{ padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none' }}>{loading ? 'Uploading…' : 'Upload'}</button>
      </div>
    </div>
  );
}
