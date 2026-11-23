import Image from "next/image";

import { ArrowRightIcon, CheckIcon } from "@/components/icons/PawVaultIcons";
import { products } from "@/data/products";

type Product = (typeof products)[number];

type ShowcaseItem = {
  product: Product;
  image: string;
  surface: string;
  ink: string;
  accent: string;
  check: string;
  cta: string;
  imageClass: string;
};

const rupees = (value: number | string) =>
  `Rs ${Number(value).toLocaleString("en-IN")}`;

const findProduct = (hint: string): Product =>
  products.find((p) => p.shortName.toLowerCase() === hint) ??
  products.find((p) => p.name.toLowerCase().includes(hint)) ??
  products[0]!;

const items: ShowcaseItem[] = [
  {
    product: findProduct("pure"),
    image: "/images/pawvault-pure-assembled.webp",
    surface: "bg-[#F4B8C4]",
    ink: "text-[#12352E]",
    accent: "text-[#12352E]",
    check: "text-[#12352E]",
    cta: "bg-[#12352E] text-[#F7EFE2]",
    imageClass: "scale-[1.20] origin-top-left object-cover object-[48%_24%]",
  },
  {
    product: findProduct("smart"),
    image: "/images/pawvault-smart-hero.webp",
    surface: "bg-[#12352E]",
    ink: "text-[#F7EFE2]",
    accent: "text-[#F5C942]",
    check: "text-[#F5C942]",
    cta: "bg-[#F5C942] text-[#211A17]",
    imageClass: "scale-[1.24] origin-top-left object-cover object-[42%_36%]",
  },
];

export default function ExplorerShowcase() {
  return (
    <div id="explorers" className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <span className="chip">Meet the explorers</span>
          <h2 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">
            Two companions, one promise of calmer days
          </h2>
        </div>
        <p className="max-w-sm text-sm opacity-70">
          Pick the PawVault that fits your routine. Both keep every treat
          secure and every adventure tidy.
        </p>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        {items.map((item) => {
          const { product } = item;
          return (
            <article
              key={product.id}
              className={`${item.surface} ${item.ink} flex flex-col rounded-3xl p-5 sm:p-6`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
                <Image
                  src={item.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`h-full w-full ${item.imageClass}`}
                />
              </div>

              <div className="flex flex-1 flex-col px-1 pt-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-3xl">{product.name}</h3>
                  <span className={`tnum text-2xl font-semibold ${item.accent}`}>
                    {rupees(product.price)}
                  </span>
                </div>
                <p className={`mt-1 text-sm font-medium opacity-80 ${item.accent}`}>
                  {product.tagline}
                </p>

                <ul className="mt-5 grid gap-2.5">
                  {product.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 shrink-0 ${item.check}`}>
                        <CheckIcon className="h-4 w-4" />
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#configure"
                  className={`btn-magnetic mt-7 inline-flex items-center justify-center gap-2 self-start rounded-full px-6 py-3 text-sm font-semibold ${item.cta}`}
                >
                  Configure {product.shortName}
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
