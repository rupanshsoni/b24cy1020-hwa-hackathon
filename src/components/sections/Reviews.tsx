"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, StarIcon } from "@/components/icons/PawVaultIcons";
import { initialReviews, type Review } from "@/data/reviews";
import { useStore } from "@/store/StoreContext";

function Stars({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          filled={i < rating}
          className={`${size} ${i < rating ? "text-[#9A6B12]" : "text-[#9A6B12]/30"}`}
        />
      ))}
    </span>
  );
}

export default function Reviews() {
  const { dogName } = useStore();
  const dogEdited = useRef(false);
  const [filter, setFilter] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [form, setForm] = useState({ name: "", dog: dogName, rating: 5, title: "", body: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!dogEdited.current) {
      setForm((prev) => ({ ...prev, dog: dogName }));
    }
  }, [dogName]);

  const average = useMemo(
    () => (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
    [reviews],
  );
  const visible = filter === null ? reviews : reviews.filter((r) => r.rating === filter);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.title.trim() || !form.body.trim()) {
      setMessage("Please fill in your name, a title and your review.");
      return;
    }
    const review: Review = {
      id: `r-${Date.now()}`,
      name: form.name.trim(),
      dog: form.dog.trim() || "My dog",
      rating: form.rating,
      title: form.title.trim(),
      body: form.body.trim(),
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      version: "Smart",
    };
    setReviews((prev) => [review, ...prev]);
    dogEdited.current = false;
    setForm({ name: "", dog: dogName, rating: 5, title: "", body: "" });
    setMessage("Thanks! Your review is live.");
  }

  return (
    <section
      id="reviews"
      data-nav-theme="light"
      className="-mt-10 scroll-mt-24 rounded-t-[40px] bg-[#F4B8C4] py-20 pb-28 lg:-mt-14 lg:rounded-t-[56px]"
    >
      <div className="section-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">From real homes</p>
            <h2 className="display-title mt-3">Happy dogs, happy humans.</h2>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/45 px-5 py-3">
            <span className="font-display text-4xl font-bold tnum">{average}</span>
            <span>
              <Stars rating={Math.round(Number(average))} size="h-4 w-4" />
              <span className="block text-xs text-cocoa/60">{reviews.length} reviews</span>
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter reviews by rating">
          {[null, 5, 4, 3, 2, 1].map((r) => (
            <button
              key={r ?? "all"}
              type="button"
              onClick={() => setFilter(r)}
              aria-pressed={filter === r}
              className={`chip rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filter === r
                  ? "border-cocoa bg-cocoa text-oat"
                  : "border-cocoa/15 bg-white/55 hover:border-cocoa/40 hover:bg-white/80"
              }`}
            >
              {r === null ? "All reviews" : (
                <span className="inline-flex items-center gap-1.5">
                  <Stars rating={r} size="h-3.5 w-3.5" />
                  <span>{r}</span>
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((review) => (
            <article key={review.id} className="rounded-2xl bg-[#F7EFE2] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <Stars rating={review.rating} />
                <span className="chip text-[10px]">{review.version}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold">{review.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cocoa/65">{review.body}</p>
              <p className="mt-4 text-xs font-semibold text-cocoa/50">
                {review.name} | {review.dog} | {review.date}
              </p>
            </article>
          ))}
        </div>

        <form onSubmit={submit} className="mt-10 grid gap-4 rounded-2xl bg-[#F7EFE2] p-6 shadow-sm sm:grid-cols-2 sm:p-8">
          <div className="sm:col-span-2">
            <p className="eyebrow">Add your review</p>
            <h3 className="mt-1 font-display text-2xl font-bold">How is {dogName} getting on?</h3>
          </div>
          <div>
            <label htmlFor="review-name" className="mb-1.5 block text-sm font-semibold">Your name</label>
            <input id="review-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="Asha" />
          </div>
          <div>
            <label htmlFor="review-dog" className="mb-1.5 block text-sm font-semibold">Dog&apos;s name</label>
            <input
              id="review-dog"
              value={form.dog}
              onChange={(e) => {
                dogEdited.current = true;
                setForm({ ...form, dog: e.target.value });
              }}
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold" id="review-rating-label">Rating</span>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="review-rating-label">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  aria-pressed={form.rating === n}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                    form.rating >= n ? "border-[#9A6B12] bg-[#9A6B12]/10" : "border-cocoa/15 bg-white/55"
                  }`}
                >
                  <StarIcon filled={form.rating >= n} className={`h-5 w-5 ${form.rating >= n ? "text-[#9A6B12]" : "text-[#9A6B12]/30"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="review-title" className="mb-1.5 block text-sm font-semibold">Title</label>
            <input id="review-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="field" placeholder="Three hours of actual quiet" />
          </div>
          <div>
            <label htmlFor="review-body" className="mb-1.5 block text-sm font-semibold">Your review</label>
            <input id="review-body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="field" placeholder="What changed for your dog?" />
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button type="submit" className="btn-primary btn-magnetic">Post review</button>
            {message && (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700" role="status">
                <CheckIcon className="h-4 w-4" />
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
