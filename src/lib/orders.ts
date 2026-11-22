import { randomInt } from "crypto";
import { getAddOn } from "@/data/addons";
import { getProduct } from "@/data/products";
import { promos } from "@/data/promos";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  dogSize?: string;
  dogName?: string;
};

export type Order = {
  id: string;
  status: "Confirmed";
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    paymentMethod: "upi" | "card" | "cod";
  };
  items: OrderItem[];
  promoCode: string | null;
  subtotal: number;
  discount: number;
  total: number;
  freeDelivery: boolean;
};

type OrderStore = {
  orders: Map<string, Order>;
  seeded: boolean;
};

const globalStore = globalThis as unknown as { __pawvaultOrders?: OrderStore };

function store(): OrderStore {
  if (!globalStore.__pawvaultOrders) {
    globalStore.__pawvaultOrders = { orders: new Map(), seeded: false };
  }
  return globalStore.__pawvaultOrders;
}

const ORDERS_FILE = "/tmp/pawvault-orders.json";

function persistToDisk() {
  if (typeof window !== "undefined") return;
  try {
    const fs = require("fs") as typeof import("fs");
    fs.writeFileSync(
      ORDERS_FILE,
      JSON.stringify(Array.from(store().orders.values()), null, 2),
      "utf8",
    );
  } catch {
    // /tmp may be unavailable; in-memory store still serves requests
  }
}

function loadFromDisk() {
  try {
    const fs = require("fs") as typeof import("fs");
    if (!fs.existsSync(ORDERS_FILE)) return;
    const data = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")) as Order[];
    for (const order of data) {
      if (order?.id) store().orders.set(order.id, order);
    }
  } catch {
    // ignore corrupt or missing file
  }
}

function seed() {
  const s = store();
  if (s.seeded) return;
  s.seeded = true;
  loadFromDisk();
  const samples: Order[] = [
    {
      id: "PV-2026-1001",
      status: "Confirmed",
      createdAt: "2026-08-18T09:24:00.000Z",
      customer: {
        name: "Ananya Rao",
        email: "ananya@example.com",
        phone: "9876543210",
        address: "12 Linden Residency, 4th Cross",
        city: "Bengaluru",
        pincode: "560034",
        paymentMethod: "upi",
      },
      items: [
        {
          id: "product-smart-mint-medium-Ananya",
          name: "PawVault Smart",
          price: 4299,
          quantity: 1,
          color: "mint",
          dogSize: "medium",
          dogName: "Miso",
        },
      ],
      promoCode: "GOODBOY15",
      subtotal: 4299,
      discount: 645,
      total: 3654,
      freeDelivery: true,
    },
    {
      id: "PV-2026-1002",
      status: "Confirmed",
      createdAt: "2026-07-04T14:02:00.000Z",
      customer: {
        name: "Rohit Kumar",
        email: "rohit@example.com",
        phone: "9123456789",
        address: "7 Shell Apartments, Marine Drive",
        city: "Mumbai",
        pincode: "400020",
        paymentMethod: "card",
      },
      items: [
        {
          id: "product-pure-blush-large-Rohit",
          name: "PawVault Pure",
          price: 2499,
          quantity: 1,
          color: "blush",
          dogSize: "large",
          dogName: "Bruno",
        },
        {
          id: "addon-nail-sheets",
          name: "6-Pack Replacement Fine-Grit Nail Sheets",
          price: 299,
          quantity: 1,
        },
      ],
      promoCode: null,
      subtotal: 2798,
      discount: 0,
      total: 2798,
      freeDelivery: false,
    },
    {
      id: "PV-2026-1003",
      status: "Confirmed",
      createdAt: "2026-09-11T06:41:00.000Z",
      customer: {
        name: "Priya Menon",
        email: "priya@example.com",
        phone: "9988776655",
        address: "21 Kamal Cottage, Sector 9",
        city: "Pune",
        pincode: "411045",
        paymentMethod: "cod",
      },
      items: [
        {
          id: "product-smart-oat-small-Priya",
          name: "PawVault Smart",
          price: 4299,
          quantity: 1,
          color: "oat",
          dogSize: "small",
          dogName: "Coco",
        },
        {
          id: "addon-botanical-discs",
          name: "4-Scent Botanical Rotation Discs",
          price: 349,
          quantity: 1,
        },
      ],
      promoCode: "CALMPUP10",
      subtotal: 4648,
      discount: 465,
      total: 4183,
      freeDelivery: true,
    },
  ];
  for (const order of samples) {
    if (!s.orders.has(order.id)) s.orders.set(order.id, order);
  }
}

export type ValidationResult =
  | { ok: true; order: Order }
  | { ok: false; errors: Record<string, string> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateAndCreateOrder(payload: unknown): ValidationResult {
  seed();
  const errors: Record<string, string> = {};

  if (!isRecord(payload)) {
    return { ok: false, errors: { body: "Request body must be a JSON object." } };
  }

  const c = isRecord(payload.customer) ? payload.customer : {};
  const name = str(c.name);
  const email = str(c.email);
  const phone = str(c.phone);
  const address = str(c.address);
  const city = str(c.city);
  const pincode = str(c.pincode);
  const paymentMethod = str(c.paymentMethod);

  if (name.length < 2) errors["customer.name"] = "Please enter your full name (at least 2 characters).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors["customer.email"] = "Please enter a valid email address.";
  if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) errors["customer.phone"] = "Please enter a valid 10-digit phone number.";
  if (address.length < 6) errors["customer.address"] = "Please enter a complete delivery address.";
  if (city.length < 2) errors["customer.city"] = "Please enter your city.";
  if (!/^\d{6}$/.test(pincode)) errors["customer.pincode"] = "Please enter a valid 6-digit pincode.";
  if (!["upi", "card", "cod"].includes(paymentMethod)) {
    errors["customer.paymentMethod"] = "Payment method must be upi, card or cod.";
  }

  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  if (rawItems.length === 0) errors.items = "Your cart is empty. Add a PawVault before checking out.";

  const validatedItems: OrderItem[] = [];
  rawItems.forEach((raw, index) => {
    if (!isRecord(raw)) {
      errors[`items.${index}`] = "Each item must be an object.";
      return;
    }
    const id = str(raw.id);
    const quantity = Number(raw.quantity);
    let knownPrice: number | undefined;
    let knownName = "";

    if (id.startsWith("product-")) {
      const productId = id.replace(/^product-/, "").split("-")[0];
      const product = getProduct(productId);
      if (product) {
        knownPrice = product.price;
        knownName = product.name;
      }
    } else if (id.startsWith("addon-")) {
      const addonId = id.replace(/^addon-/, "");
      const addon = getAddOn(addonId);
      if (addon) {
        knownPrice = addon.price;
        knownName = addon.name;
      }
    }

    if (knownPrice === undefined) {
      errors[`items.${index}.id`] = "Unknown product or add-on in cart.";
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      errors[`items.${index}.quantity`] = "Quantity must be between 1 and 20.";
      return;
    }

    validatedItems.push({
      id,
      name: knownName,
      price: knownPrice,
      quantity,
      color: str(raw.color) || undefined,
      dogSize: str(raw.dogSize) || undefined,
      dogName: str(raw.dogName) || undefined,
    });
  });

  let promoCode: string | null = null;
  const rawPromo = str(payload.promoCode).toUpperCase();
  if (rawPromo) {
    const found = promos.find((p) => p.code === rawPromo);
    if (!found) errors.promoCode = "Invalid promo code. Use GOODBOY15 or CALMPUP10.";
    else promoCode = found.code;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const subtotal = validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = promoCode
    ? Math.round(subtotal * ((promos.find((p) => p.code === promoCode)?.percent ?? 0) / 100))
    : 0;
  const total = Math.max(0, subtotal - discount);

  let id = "";
  do {
    id = `PV-2026-${randomInt(10000, 99999)}`;
  } while (store().orders.has(id));

  const order: Order = {
    id,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
    customer: {
      name,
      email,
      phone,
      address,
      city,
      pincode,
      paymentMethod: paymentMethod as Order["customer"]["paymentMethod"],
    },
    items: validatedItems,
    promoCode,
    subtotal,
    discount,
    total,
    freeDelivery: subtotal >= 3000,
  };

  store().orders.set(id, order);
  persistToDisk();
  return { ok: true, order };
}

export function getOrder(id: string): Order | undefined {
  seed();
  return store().orders.get(id.trim().toUpperCase());
}

export function allOrders(): Order[] {
  seed();
  return Array.from(store().orders.values());
}
