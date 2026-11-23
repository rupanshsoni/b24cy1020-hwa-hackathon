const ledger = [
  { label: "of every order", value: "10%" },
  { label: "meals funded", value: "1,280+" },
  { label: "cities active", value: "3" },
  { label: "current batch", value: "PV-2026" },
];

const ink = "#12352E";
const hairline = "rgba(18, 53, 46, 0.35)";

export default function Mission() {
  return (
    <section
      id="mission"
      data-nav-theme="light"
      className="scroll-mt-24"
      style={{ backgroundColor: "#F5C942", color: ink }}
    >
        <div className="section-shell pt-16 pb-28 sm:pt-24 sm:pb-32">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Our mission</p>
            <h2 className="display-title mt-3">Good dogs everywhere.</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed">
              Street dogs have no one to speak for them. We speak for them with
              every order you place. Ten percent of what you spend goes to
              feeding stations and basic vet care in the cities we ship to. No
              glossy reports. No empty promises. Just food in bowls and medicine
              where it is needed, and we show you the photos from the field to
              prove it. You should be able to see exactly where your money goes.
            </p>

            <div className="mt-12">
              <p className="eyebrow">Impact ledger</p>
              <dl className="mt-4">
                {ledger.map((row) => (
                  <div
                    key={row.value}
                    className="flex items-baseline justify-between gap-6 border-t py-3"
                    style={{ borderColor: hairline }}
                  >
                    <dt className="uppercase tracking-wide">{row.label}</dt>
                    <dd className="font-display tnum text-2xl font-bold sm:text-3xl">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <figure className="m-0">
            <div
              className="border p-2"
              style={{ borderColor: ink }}
            >
              <img
                src="/images/mission-street-dog-care.webp"
                alt="A volunteer providing food and basic care to a street dog"
                className="block w-full object-cover"
                style={{ aspectRatio: "4 / 5" }}
                loading="lazy"
              />
            </div>
            <figcaption
              className="mt-3 text-xs uppercase tracking-widest"
              style={{ opacity: 0.7 }}
            >
              From the field
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
