import { Suspense } from "react";
import TrackClient from "@/components/TrackClient";

export const metadata = { title: "Track Order | PawVault" };

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="section-shell py-24 text-center">Loading…</div>}>
      <TrackClient />
    </Suspense>
  );
}
