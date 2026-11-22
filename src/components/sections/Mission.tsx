export default function Mission() {
  return (
    <section id="mission" className="section-shell scroll-mt-24 py-16">
      <div className="card overflow-hidden bg-gradient-to-br from-mint/50 via-oat to-blush/50 p-8 sm:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">10% of every order</p>
            <h2 className="display-title mt-3">Good dogs everywhere.</h2>
            <p className="mt-5 max-w-lg leading-relaxed text-cocoa/70">
              Every PawVault order funds feeding stations and basic veterinary care for street dogs in the cities we ship to. We publish the running impact total and share photos from the field — because the dogs who have nothing still deserve a little enrichment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/80 px-5 py-4">
                <p className="font-display text-3xl font-bold">10%</p>
                <p className="text-xs text-cocoa/60">of revenue, every order</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-5 py-4">
                <p className="font-display text-3xl font-bold">1,280+</p>
                <p className="text-xs text-cocoa/60">meals funded so far</p>
              </div>
            </div>
          </div>
          <div className="relative mx-auto grid h-72 w-72 place-items-center rounded-full border-[14px] border-white/80 bg-butter/30 shadow-soft">
            <div className="text-center">
              <p className="text-7xl">🐕</p>
              <p className="mt-2 font-display text-xl font-bold">Thank you.</p>
            </div>
            <span className="absolute -left-2 top-6 grid h-14 w-14 place-items-center rounded-full bg-sky text-white shadow-soft">🐾</span>
            <span className="absolute -right-3 bottom-10 grid h-12 w-12 place-items-center rounded-full bg-blush shadow-soft">♥</span>
          </div>
        </div>
      </div>
    </section>
  );
}
