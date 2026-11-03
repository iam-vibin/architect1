import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Star, MessageSquare } from 'lucide-react';

export default function ReviewsList({
  professional,
  refreshTrigger,
}: {
  professional: string;
  refreshTrigger?: number;
}) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReviews = async () => {
    if (!professional) return;
    setLoading(true);
    try {
      const data = await api.reviews.list(professional);
      if (data && data.success) {
        setReviews(data.reviews || []);
        setAvg(data.average || null);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [professional, refreshTrigger]);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground text-base">Client Reviews</h3>
          <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground font-medium">
            {reviews.length}
          </span>
        </div>
        {avg !== null && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg text-sm font-semibold">
            <Star className="w-4 h-4 fill-current text-amber-500" />
            <span>{avg.toFixed(1)} / 5.0</span>
          </div>
        )}
      </div>

      {loading && reviews.length === 0 && (
        <div className="text-xs text-muted-foreground py-4 text-center">Loading reviews...</div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="text-center py-6 bg-muted/20 rounded-xl border border-dashed border-border mt-3">
          <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-1.5" />
          <p className="text-sm font-medium text-foreground">No reviews yet</p>
          <p className="text-xs text-muted-foreground">Be the first client to review this professional!</p>
        </div>
      )}

      <div className="space-y-3 mt-3">
        {reviews.map((r, i) => (
          <div
            key={r.id || i}
            className="p-4 rounded-xl bg-card border border-border shadow-sm transition hover:border-border/80"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-xs text-primary">
                  {r.userAvatar ? (
                    <img src={r.userAvatar} alt={r.userName} className="w-full h-full object-cover" />
                  ) : (
                    (r.userName || 'U')[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.userName || 'Verified Client'}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded text-amber-600 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{r.rating}.0</span>
              </div>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed pl-10">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
