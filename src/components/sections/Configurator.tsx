"use client";

import Image from "next/image";
import { useState } from "react";
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

  const product = products.find((p) => p.id === version)!;
  const addOnTotal = addOns
    .filter((a) => selectedAddOns.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const grandTotal = product.price + addOnTotal;

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
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
    <section id="configure" className="scroll-mt-24 bg-white/50 py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Build your vault</p>
          <h2 className="display-title mt-3">Make it yours, {dogName}.</h2>
          <p className="mt-4 text-cocoa/65">Pick a version, a shell colour that reads calm to your dog, and the add-ons that fit your routine.</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.05fr]">
          <div className="h-fit lg:sticky lg:top-24">
            <div className={`relative overflow-hidden rounded-4xl border border-white/70 shadow-soft ${color === "blush" ? "bg-blush/50" : color === "mint" ? "bg-mint/50" : "bg-oat"}`}>
              <span className="absolute left-5 top-5 z-10 chip bg-white/85">{product.name}</span>
              <Image
                key={version}
                src={product.image}
                alt={`${product.name} in ${shellColors.find((c) => c.id === color)?.name}`}
                width={1600}
                height={1300}
                className="mx-auto h-[420px] w-auto max-w-full object-contain sm:h-[520px]"
              />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl bg-white/85 px-4 py-3 backdrop-blur">
                <span className="text-xs font-semibold text-cocoa/60">Your build</span>
                <span className="text-sm font-bold">{formatINR(grandTotal)}</span>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-cocoa/10 bg-white/70 p-4 text-sm">
              <p className="eyebrow">Live build summary</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-cocoa/55">Version</dt><dd className="text-right font-semibold">{product.name}</dd>
                <dt className="text-cocoa/55">Shell</dt><dd className="text-right font-semibold">{shellColors.find((c) => c.id === color)?.name}</dd>
                <dt className="text-cocoa/55">Dog size</dt><dd className="text-right font-semibold">{dogSizes.find((d) => d.id === size)?.name} · {name || "Bruno"}</dd>
                <dt className="text-cocoa/55">Add-ons</dt><dd className="text-right font-semibold">{selectedAddOns.length} selected</dd>
              </dl>
              <div className="mt-3 flex items-center justify-between border-t border-cocoa/10 pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-display text-lg font-bold">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <div>
              <p className="eyebrow">01 · Version</p>
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
              <p className="eyebrow">02 · Shell colour</p>
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
              <p className="eyebrow">03 · Dog size</p>
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
                    <span className="block text-[10px] opacity-70">{d.detail}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="eyebrow">04 · Your dog&apos;s name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field mt-3"
                placeholder="Bruno"
                aria-label="Dog name"
              />
              <p className="mt-1.5 text-xs text-cocoa/50">Used for voice callouts on Smart and engraved on your receipt.</p>
            </div>

            <div className="mt-7">
              <p className="eyebrow">05 · Add-ons</p>
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
                        {selected ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-semibold">{a.name}</span>
                      <span className="text-sm font-bold">{formatINR(a.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button" onClick={handleAdd} className="btn-primary mt-8 w-full">
              {added ? "Added to cart ✓" : `Add to cart · ${formatINR(grandTotal)}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
