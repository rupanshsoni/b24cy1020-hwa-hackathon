"use client";

import { useMemo, useState } from "react";
import { initialReviews, type Review } from "@/data/reviews";
import { useStore } from "@/store/StoreContext";

export default function Reviews() {
  const { dogName } = useStore();
  const [filter, setFilter] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [form, setForm] = useState({ name: "", dog: dogName, rating: 5, title: "", body: "" });
  const [message, setMessage] = useState("");

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
    setForm({ name: "", dog: dogName, rating: 5, title: "", body: "" });
    setMessage("Thanks! Your review is live.");
  }

  return (
    <section id="reviews" className="section-shell scroll-mt-24 py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">From real homes</p>
          <h2 className="display-title mt-3">Happy dogs, happy humans.</h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-butter/30 px-5 py-3">
          <span className="font-display text-4xl font-bold">{average}</span>
          <span>
            <span className="block text-[#C8912B] text-lg">★★★★★</span>
            <span className="block text-xs text-cocoa/60">{reviews.length} reviews</span>
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {[null, 5, 4, 3, 2, 1].map((r) => (
          <button
            key={r ?? "all"}
            type="button"
            onClick={() => setFilter(r)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filter === r ? "border-cocoa bg-cocoa text-oat" : "border-cocoa/15 bg-white/70 hover:border-cocoa/40"
            }`}
          >
            {r === null ? "All" : `${r} ★`}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((review) => (
          <article key={review.id} className="card p-6">
            <div className="flex items-center justify-between">
              <span className="text-butter text-lg">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
              <span className="chip text-[10px]">{review.version}</span>
            </div>
            <h3 className="mt-3 font-display text-lg font-bold">{review.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-cocoa/65">{review.body}</p>
            <p className="mt-4 text-xs font-semibold text-cocoa/50">
              {review.name} · {review.dog} · {review.date}
            </p>
          </article>
        ))}
      </div>

      <form onSubmit={submit} className="card mt-10 grid gap-4 p-6 sm:p-8 sm:grid-cols-2">
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
          <input id="review-dog" value={form.dog} onChange={(e) => setForm({ ...form, dog: e.target.value })} className="field" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="review-rating" className="mb-1.5 block text-sm font-semibold">Rating</label>
          <select id="review-rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="field">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="review-title" className="mb-1.5 block text-sm font-semibold">Title</label>
          <input id="review-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="field" placeholder="Three hours of actual quiet" />
        </div>
        <div>
          <label htmlFor="review-body" className="mb-1.5 block text-sm font-semibold">Your review</label>
          <input id="review-body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="field" placeholder="What changed for your dog?" />
        </div>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
          <button type="submit" className="btn-primary">Post review</button>
          {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}
        </div>
      </form>
    </section>
  );
}
