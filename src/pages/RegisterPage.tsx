import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const sel = typeof window !== 'undefined' ? localStorage.getItem('archifind_selected_role') : null;
      setSelectedRole(sel);
    } catch (err) {
      setSelectedRole(null);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const roleToSend = selectedRole || 'user';

    try {
      const url = `${API_BASE}/api/auth/register`;
      console.log('Registering user', { url, username, role: roleToSend, fullName: name });
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, role: roleToSend }),
        credentials: 'include',
      });

      let body: any = null;
      try {
        body = await res.json();
      } catch (parseErr) {
        console.error('Failed to parse JSON response:', parseErr);
        setError('Server returned invalid JSON');
        setLoading(false);
        return;
      }

      console.log('Register response', { status: res.status, ok: res.ok, body });

      if (!res.ok) {
        // Show backend error message if available
        const errorMsg = (body && (body.message || body.error)) || `Registration failed (status ${res.status})`;
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Only navigate if success is true
      if (body && body.success) {
        setLoading(false);
        navigate('/login');
      } else {
        setError(body?.message || 'Registration succeeded but server response was unexpected');
        setLoading(false);
      }
    } catch (err: any) {
      // network / CORS / backend down - proper error message
      console.error('Network error during registration:', err);
      const networkErr = err?.message || 'Unknown error';
      setError(`Network error: ${networkErr} (backend: ${API_BASE})`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-4">Create an account</h1>
        {selectedRole && <div className="text-sm text-muted-foreground mb-3">Registering as <strong>{selectedRole}</strong></div>}
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

        <label className="block mb-2">
          <span className="text-sm">Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded" />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded" />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded" />
        </label>

        <div className="flex items-center justify-between">
          <button disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded">{loading ? 'Creating...' : 'Create account'}</button>
        </div>
      </form>
    </div>
  );
}
