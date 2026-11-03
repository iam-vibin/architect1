import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Building2, MapPin, ShieldCheck, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function QuoteRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [professional, setProfessional] = useState<any | null>(null);
  const [loadingProf, setLoadingProf] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    projectType: 'Residential Villa Design',
    description: '',
    budget: '₹1,50,000 - ₹3,00,000',
    timeline: '1-2 Months',
    phone: user?.phone || '',
    location: user?.location || 'Chennai',
  });

  useEffect(() => {
    if (!id) return;
    setLoadingProf(true);
    api.professionals
      .get(id)
      .then((res) => {
        if (res && res.success && res.professional) {
          setProfessional(res.professional);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingProf(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professional) return;
    if (!formData.description.trim()) {
      setError('Please provide project details and requirements');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.quotes.request({
        professionalId: professional.id,
        projectType: formData.projectType,
        description: formData.description.trim(),
        location: formData.location,
        budget: formData.budget,
        timeline: formData.timeline,
        userPhone: formData.phone,
      });

      if (!res || !res.success) {
        setError(res?.error || 'Failed to submit quote request');
        setSubmitting(false);
        return;
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Quote request error:', err);
      setError(err?.message || 'Network error while submitting quote request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProf) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm text-muted-foreground animate-pulse">Loading quotation form...</p>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
        <p className="text-muted-foreground text-sm mb-4">Professional not found.</p>
        <Button onClick={() => navigate('/user-dashboard')} size="sm">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-card border border-border p-8 rounded-3xl max-w-md w-full shadow-elevated space-y-4 animate-scale-in">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Quote Request Submitted!</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your project brief has been sent to <strong>{professional.name}</strong>. You will receive an estimate and proposal in your dashboard.
          </p>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-left">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>Once quoted, your project will be eligible for 100% Escrow Protection.</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/user-dashboard')}
              className="flex-1 text-xs h-10"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate(`/chat/${professional.id}`)}
              className="flex-1 text-xs h-10 bg-primary hover:bg-primary/90"
            >
              Open Direct Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-bold text-sm text-foreground">Request Quotation</span>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Professional Target Card */}
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <img
            src={professional.avatar}
            alt={professional.name}
            className="w-14 h-14 rounded-xl object-cover bg-muted border border-border"
          />
          <div>
            <h2 className="font-bold text-foreground text-sm">{professional.name}</h2>
            <p className="text-xs text-muted-foreground">{professional.profession} • {professional.location}</p>
            <p className="text-[11px] text-amber-500 font-semibold mt-0.5">⭐ {professional.rating} ({professional.reviewsCount || 0} reviews)</p>
          </div>
        </div>

        {/* Quote Form */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
          <div>
            <h1 className="text-lg font-bold text-foreground">Tell us about your project</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Provide as much detail as possible so the architect can give you an accurate estimate.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Project Category</label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                className="w-full h-10 px-3 text-xs border border-border rounded-xl bg-background text-foreground"
              >
                <option value="Residential Villa Design">Residential Villa / Independent House</option>
                <option value="Apartment Interior Renovation">Apartment Interior & False Ceiling</option>
                <option value="Modular Kitchen Design">Modular Kitchen & Wardrobes</option>
                <option value="Commercial Office Interior">Commercial Office Workspace</option>
                <option value="Turnkey Civil Construction">Full Turnkey Civil Construction</option>
                <option value="Landscape & Terrace Garden">Landscape & Terrace Garden</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Project Scope & Requirements (Dimensions, style, rooms, special needs)
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. 2400 sq.ft plot, East facing. Looking for G+1 duplex with 3 bedrooms, home theatre, open kitchen and modern elevation. Need 3D plans, structural engineering, and municipal drawing submission..."
                className="min-h-[120px] text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Approximate Budget Range</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-border rounded-xl bg-background text-foreground"
                >
                  <option value="₹50,000 - ₹1,50,000">₹50,000 - ₹1,50,000</option>
                  <option value="₹1,50,000 - ₹3,00,000">₹1,50,000 - ₹3,00,000</option>
                  <option value="₹3,00,000 - ₹8,00,000">₹3,00,000 - ₹8,00,000</option>
                  <option value="₹8,00,000 - ₹25,00,000">₹8,00,000 - ₹25,00,000</option>
                  <option value="₹25,00,000+">₹25,00,000+</option>
                  <option value="Flexible / Need Guidance">Flexible / Need Guidance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Desired Timeline</label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-border rounded-xl bg-background text-foreground"
                >
                  <option value="Immediate (1-2 Weeks)">Immediate (1-2 Weeks)</option>
                  <option value="1-2 Months">1-2 Months</option>
                  <option value="3-6 Months">3-6 Months</option>
                  <option value="Planning for Future">Planning for Future</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Project Site Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. OMR, Chennai"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Contact Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold text-xs gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Request...' : 'Send Quotation Request'}</span>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
