"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SnowflakeTrayIcon, GritSheetIcon, BotanicalLeafIcon, CheckIcon, ArrowRightIcon } from "@/components/icons/PawVaultIcons";
import { products, shellColors, dogSizes } from "@/data/products";
import { addOns } from "@/data/addons";
import { useStore, formatINR, addonItem, productItem } from "@/store/StoreContext";

export default function Configurator() {
  const { addItem, dogName, setDogName } = useStore();
  const [version, setVersion] = useState<"pure" | "smart">("smart");
  const [color, setColor] = useState("mint");
  const [size, setSize] = useState("medium");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [name, setName] = useState(dogName);
  const [added, setAdded] = useState(false);
  const [viewMode, setViewMode] = useState<"product" | "lifestyle">("product");
  const nameEdited = useRef(false);

  useEffect(() => {
    if (!nameEdited.current) {
      setName(dogName);
    }
  }, [dogName]);

  const product = products.find((p) => p.id === version)!;
  const addOnTotal = addOns
    .filter((a) => selectedAddOns.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const grandTotal = product.price + addOnTotal;

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function addOnIcon(id: string) {
    if (id === "freezer-trays") return <SnowflakeTrayIcon className="h-4 w-4" />;
    if (id === "nail-sheets") return <GritSheetIcon className="h-4 w-4" />;
    if (id === "botanical-discs") return <BotanicalLeafIcon className="h-4 w-4" />;
    return null;
  }

  function handleAdd() {
    setDogName(name);
    const item = productItem(version, color, size, name);
    if (item) addItem(item);
    selectedAddOns.forEach((id) => {
      const addon = addonItem(id);
      if (addon) addItem(addon, 1);
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <section id="configure" data-nav-theme="light" className="scroll-mt-24 overflow-x-clip bg-[#EFE3CF] py-20 pb-28 text-pine">
      <div className="section-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Build your vault</p>
          <h2 className="display-title mt-3">Make it yours, {dogName}.</h2>
          <p className="mt-4 text-cocoa/65">Pick a version, a shell colour that reads calm to your dog, and the add-ons that fit your routine.</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.05fr]">
          <div className="h-fit lg:sticky lg:top-24">
            <div className={`relative overflow-hidden rounded-4xl border border-white/70 shadow-soft ${color === "blush" ? "bg-[#F4B8C4]" : color === "mint" ? "bg-[#8FD3C5]" : "bg-[#F7EFE2]"}`}>
              <span className="absolute left-5 top-5 z-10 chip bg-white/85">{product.name}</span>
              <div className="absolute right-5 top-5 z-10 flex items-center gap-1 rounded-full bg-white/85 p-1 text-xs font-semibold backdrop-blur">
                <button
                  type="button"
                  onClick={() => setViewMode("product")}
                  className={`rounded-full px-3 py-1.5 transition ${viewMode === "product" ? "bg-pine text-cream" : "text-pine/60"}`}
                >
                  Product
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("lifestyle")}
                  className={`rounded-full px-3 py-1.5 transition ${viewMode === "lifestyle" ? "bg-pine text-cream" : "text-pine/60"}`}
                >
                  In Your Home
                </button>
              </div>
              {viewMode === "product" ? (
                <Image
                  key={version}
                  src={product.image}
                  alt={`${product.name} in ${shellColors.find((c) => c.id === color)?.name}`}
                  width={1600}
                  height={1300}
                  className={`mx-auto h-[420px] w-full max-w-full object-cover sm:h-[520px] ${
                    version === "smart"
                      ? "scale-[1.24] origin-top-left object-cover object-[42%_36%]"
                      : "scale-[1.20] origin-top-left object-cover object-[48%_24%]"
                  }`}
                />
              ) : (
                <Image
                  src="/images/lifestyle-living-room-dog.webp"
                  alt={`${product.name} in a living room`}
                  width={1600}
                  height={1300}
                  className="mx-auto h-[420px] w-full max-w-full object-cover sm:h-[520px]"
                />
              )}
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl bg-cream/90 px-4 py-3 backdrop-blur">
                <span className="tnum text-xs font-semibold text-cocoa/60">Your build</span>
                <span className="tnum text-sm font-bold">{formatINR(grandTotal)}</span>
              </div>
            </div>
            <div className="card-dark mt-4 bg-pine p-5 text-sm text-cream">
              <p className="eyebrow">Live build summary</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-cream/55">Version</dt><dd className="text-right font-semibold">{product.name}</dd>
                <dt className="text-cream/55">Shell</dt><dd className="text-right font-semibold">{shellColors.find((c) => c.id === color)?.name}</dd>
                <dt className="text-cream/55">Dog size</dt><dd className="text-right font-semibold">{dogSizes.find((d) => d.id === size)?.name} / {name || "Bruno"}</dd>
                <dt className="text-cream/55">Add-ons</dt><dd className="text-right font-semibold">{selectedAddOns.length} selected</dd>
              </dl>
              <div className="mt-3 flex items-center justify-between border-t border-cream/15 pt-3">
                <span className="font-semibold">Total</span>
                <span className="tnum font-display text-lg font-bold text-butter">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="card bg-cream p-6 sm:p-8">
            <div>
              <p className="eyebrow">01 Version</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setVersion(p.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      version === p.id ? "border-sky bg-sky/10 ring-4 ring-sky/15" : "border-cocoa/15 bg-white/60 hover:border-cocoa/30"
                    }`}
                  >
                    <span className="font-display text-lg font-bold">{p.shortName}</span>
                    <p className="mt-1 text-xs text-cocoa/60">{formatINR(p.price)}</p>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-cocoa/65">{product.description}</p>
            </div>

            <div className="mt-7">
              <p className="eyebrow">02 Shell colour</p>
              <p className="mt-1 text-xs text-cocoa/50">Dogs see blue and yellow clearly; these shells stay calm.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {shellColors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    title={c.name}
                    aria-label={c.name}
                    className={`h-11 w-11 rounded-full border-2 transition ${color === c.id ? "border-cocoa scale-110" : "border-white"}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="eyebrow">03 Dog size</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {dogSizes.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSize(d.id)}
                    className={`rounded-xl border px-2 py-3 text-center transition ${
                      size === d.id ? "border-cocoa bg-cocoa text-oat" : "border-cocoa/15 bg-white/60"
                    }`}
                  >
                    <span className="block text-sm font-bold">{d.name}</span>
                    <span className="block text-xs opacity-70">{d.detail}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="eyebrow">04 Your dog&apos;s name</p>
              <input
                value={name}
                onChange={(e) => { nameEdited.current = true; setName(e.target.value); }}
                className="field mt-3"
                placeholder="Bruno"
                aria-label="Dog name"
              />
              <p className="mt-1.5 text-xs text-cocoa/50">Used for voice callouts on Smart and engraved on your receipt.</p>
            </div>

            <div className="mt-7">
              <p className="eyebrow">05 Add-ons</p>
              <div className="mt-3 space-y-2">
                {addOns.map((a) => {
                  const selected = selectedAddOns.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddOn(a.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        selected ? "border-sky bg-sky/10" : "border-cocoa/15 bg-white/60 hover:border-cocoa/30"
                      }`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold ${selected ? "border-cocoa bg-cocoa text-butter" : "border-cocoa/30"}`}>
                        {selected ? <CheckIcon className="h-4 w-4" /> : null}
                      </span>
                      <span className="flex shrink-0 items-center text-pine/70">{addOnIcon(a.id)}</span>
                      <span className="min-w-0 flex-1 text-sm font-semibold">{a.name}</span>
                      <span className="text-sm font-bold">{formatINR(a.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button" onClick={handleAdd} className="btn-primary btn-magnetic mt-8 w-full">
              {added ? (
                <span className="flex items-center justify-center gap-2"><CheckIcon className="h-4 w-4" /> Added to cart</span>
              ) : (
                <span className="flex items-center justify-center gap-2">Add to cart {formatINR(grandTotal)} <ArrowRightIcon className="h-4 w-4" /></span>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
