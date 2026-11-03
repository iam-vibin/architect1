import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000';

export default function ProfessionalProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [experience, setExperience] = useState(0);
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append('name', name || user?.username || '');
      form.append('profession', 'Architect'); // allow editing later; kept simple for PoC
      form.append('phoneNumber', phoneNumber);
      form.append('location', location);
      form.append('experience', String(experience));
      form.append('bio', bio);
      if (images) {
        Array.from(images).slice(0, 5).forEach((f) => form.append('images', f));
      }

      const res = await fetch(`${API_BASE}/api/professionals`, {
        method: 'POST',
        body: form,
      });

      let body: any = null;
      try { body = await res.json(); } catch (_) {}
      if (!res.ok) {
        setError((body && (body.error || body.message)) || 'Failed to save profile');
        setLoading(false);
        return;
      }

      // success - navigate to professional dashboard
      navigate('/professional-dashboard');
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Professional Profile</h2>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

        <label className="block mb-2">
          <span className="text-sm">Display name</span>
          <input className="mt-1 block w-full border px-3 py-2 rounded" value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Phone number</span>
          <input className="mt-1 block w-full border px-3 py-2 rounded" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block mb-2">
            <span className="text-sm">Experience (years)</span>
            <input type="number" min={0} className="mt-1 block w-full border px-3 py-2 rounded" value={experience} onChange={(e) => setExperience(Number(e.target.value))} />
          </label>

          <label className="block mb-2">
            <span className="text-sm">Location</span>
            <input className="mt-1 block w-full border px-3 py-2 rounded" value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
        </div>

        <label className="block mb-2">
          <span className="text-sm">Bio</span>
          <textarea className="mt-1 block w-full border px-3 py-2 rounded" value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Portfolio images (up to 5)</span>
          <input type="file" accept="image/*" multiple className="mt-1 block" onChange={(e) => setImages(e.target.files)} />
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 text-white rounded">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          <button type="button" onClick={() => navigate('/professional-dashboard')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
