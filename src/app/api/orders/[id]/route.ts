import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) {
    return NextResponse.json(
      { error: "Order not found. Check your PV-2026-XXXX order ID and try again." },
      { status: 404 },
    );
  }
  return NextResponse.json({ order }, { status: 200 });
}
