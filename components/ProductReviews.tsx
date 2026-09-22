"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MessageSquarePlus, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/context/auth-context";
import Button from "@/components/ui/Button";

export type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  profiles?: { full_name: string | null } | null;
};

export default function ProductReviews({
  productId,
  initialReviews = [],
}: {
  productId: string;
  initialReviews: ReviewItem[];
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("Please sign in to submit a review.");
      return;
    }
    if (!body.trim()) {
      setError("Please share a few words about this item.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const newRow = {
      product_id: productId,
      user_id: user.id,
      rating,
      title: title.trim() || null,
      body: body.trim(),
      status: "approved",
    };

    const { data, error: insertError } = await supabase
      .from("reviews")
      .insert(newRow)
      .select("id, rating, title, body, created_at, profiles(full_name)")
      .single();

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message || "Could not submit your review. Please try again.");
      return;
    }

    if (data) {
      setReviews((prev) => [data as unknown as ReviewItem, ...prev]);
    }
    setSubmitted(true);
    setShowForm(false);
    setTitle("");
    setBody("");
  }

  return (
    <div className="border-t border-hairline px-4 py-8">
      {/* Header & Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl italic text-bone">Customer Reviews</h2>
          <div className="mt-1 flex items-center gap-2">
            {avgRating ? (
              <>
                <div className="flex text-gold">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= Math.round(Number(avgRating)) ? "fill-gold text-gold" : "text-hairline"}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-bone">{avgRating}</span>
                <span className="text-xs text-bone/50">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
              </>
            ) : (
              <span className="text-xs text-bone/50">No reviews yet</span>
            )}
          </div>
        </div>

        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="focus-gold inline-flex items-center gap-1.5 self-start rounded-sm border border-hairline bg-charcoal px-3 py-2 text-xs font-medium text-bone hover:border-gold/50 transition-colors"
          >
            <MessageSquarePlus size={15} />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {submitted && (
        <div className="mt-4 flex items-center gap-2 rounded-sm border border-gold/40 bg-gold/10 p-3 text-xs text-gold">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>Thank you! Your review has been added.</span>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-sm border border-hairline bg-charcoal/40 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-bone">Your Review</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-bone/40 hover:text-bone"
            >
              Cancel
            </button>
          </div>

          {!user && (
            <p className="rounded-sm border border-hairline bg-charcoal p-2.5 text-xs text-bone/70">
              Please{" "}
              <Link href="/sign-in" className="text-gold underline underline-offset-2">
                Sign In
              </Link>{" "}
              to leave a verified customer review.
            </p>
          )}

          {/* Star Selector */}
          <div>
            <label className="text-[11px] text-bone/60">Rating</label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus-gold p-0.5 text-gold hover:scale-110 transition-transform"
                >
                  <Star
                    size={20}
                    className={
                      star <= (hoverRating || rating) ? "fill-gold text-gold" : "text-hairline"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-bone/60">Headline (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Great fit, premium fabric!"
              className="focus-gold mt-1 w-full rounded-sm border border-hairline bg-ink px-3 py-2 text-xs text-bone placeholder:text-bone/40"
            />
          </div>

          <div>
            <label className="text-[11px] text-bone/60">Review</label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="How did it fit? How is the material feel?"
              className="focus-gold mt-1 w-full rounded-sm border border-hairline bg-ink px-3 py-2 text-xs text-bone placeholder:text-bone/40"
            />
          </div>

          {error && <p className="text-xs text-rust">{error}</p>}

          <Button
            type="submit"
            disabled={submitting || !user}
            className="!w-auto px-5 py-2 text-xs"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      {/* Reviews List */}
      <div className="mt-6 divide-y divide-hairline">
        {reviews.map((r) => (
          <div key={r.id} className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex text-gold">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    className={s <= r.rating ? "fill-gold text-gold" : "text-hairline"}
                  />
                ))}
              </div>
              <span className="text-[11px] text-bone/40">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>

            {r.title && <p className="mt-1 text-sm font-medium text-bone">{r.title}</p>}
            {r.body && <p className="mt-1 text-xs leading-relaxed text-bone/75">{r.body}</p>}

            <p className="mt-2 text-[11px] text-bone/45">
              By {r.profiles?.full_name || "Verified Customer"}
            </p>
          </div>
        ))}

        {reviews.length === 0 && !showForm && (
          <p className="py-6 text-center text-xs text-bone/40">
            No reviews yet. Be the first to share your thoughts on this piece.
          </p>
        )}
      </div>
    </div>
  );
}
