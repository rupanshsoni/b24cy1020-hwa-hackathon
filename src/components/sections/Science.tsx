import { studies } from "@/data/studies";

export default function Science() {
  return (
    <section id="science" className="section-shell scroll-mt-24 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Evidence, not guesswork</p>
        <h2 className="display-title mt-3">Six studies built into the hardware.</h2>
        <p className="mt-4 text-cocoa/65">
          Every feature maps to peer-reviewed research on canine calm, cognition and vision.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {studies.map((study, i) => (
          <article key={study.id} className="card flex flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <span className="chip bg-sky/15">{study.tag}</span>
              <span className="font-display text-3xl font-bold text-cocoa/15">0{i + 1}</span>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold leading-snug">{study.title}</h3>
            <p className="mt-1 text-xs font-semibold text-sky">{study.authors} · {study.year}</p>
            <p className="mt-3 text-sm leading-relaxed text-cocoa/65">{study.finding}</p>
            <div className="mt-auto border-t border-cocoa/10 pt-4">
              <p className="text-xs font-bold text-cocoa/50">Mapped to</p>
              <p className="mt-1 text-sm font-semibold">{study.feature}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-8 text-center text-xs leading-relaxed text-cocoa/45">
        Citations: Shin &amp; Shin 2016 · Bowman et al. 2015/2017 · Brayley &amp; Montrose 2016 · Bennett et al. 2017 · Neitz, Geist &amp; Jacobs 1989 · Clark 2017 · Contrafreeloading study 2024 · Binks et al. 2018.
      </p>
    </section>
  );
}
