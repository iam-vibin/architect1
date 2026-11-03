import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ReviewForm({
  professional,
  onReviewSubmitted,
}: {
  professional: string;
  onReviewSubmitted?: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(true);

  useEffect(() => {
    (async () => {
      if (!professional || !user) return;
      try {
        const data = await api.reviews.list(professional);
        if (data && Array.isArray(data.reviews)) {
          const already = data.reviews.find((r: any) => r.userId === user.id || r.userName === user.username);
          setCanReview(!already);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [professional, user]);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    setMessage(null);

    if (!user) {
      return setMessage('Please sign in to submit a review');
    }

    if (!professional) return setMessage('Invalid professional');
    if (!comment.trim()) return setMessage('Please enter review comments');

    setLoading(true);
    try {
      const data = await api.reviews.submit({
        professionalId: professional,
        rating,
        comment: comment.trim(),
      });

      if (!data.success) {
        setMessage(data?.error || data?.message || 'Failed to submit review');
        return;
      }

      setMessage('Thank you! Your review has been submitted.');
      setCanReview(false);
      setComment('');
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (e) {
      setMessage('Network error while submitting review');
    } finally {
      setLoading(false);
    }
  };

  if (!canReview) {
    return (
      <div className="bg-muted/40 p-4 rounded-xl text-sm text-muted-foreground mt-4 border border-border/60">
        You have already reviewed this professional.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-card mt-6">
      <h4 className="font-semibold text-foreground text-base">Write a Review</h4>
      <p className="text-xs text-muted-foreground mt-0.5">Share your feedback about your experience with this professional</p>

      <div className="flex gap-2 items-center my-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`p-2 rounded-lg border transition-all flex items-center gap-1 ${
              rating >= n
                ? 'border-amber-400 bg-amber-50 text-amber-600 font-semibold dark:bg-amber-950/30'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            <span>{n}</span>
            <Star className={`w-4 h-4 ${rating >= n ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        ))}
      </div>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Describe the quality of design, communication, adherence to timeline, and project results..."
        className="min-h-[90px] text-sm"
      />

      {message && (
        <div
          className={`text-xs mt-2 px-3 py-1.5 rounded-lg ${
            message.includes('Thank you') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button onClick={submit} disabled={loading || !canReview} size="sm" className="bg-primary hover:bg-primary/90">
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </div>
  );
}
