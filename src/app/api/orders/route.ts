import { NextResponse } from "next/server";
import { validateAndCreateOrder } from "@/lib/orders";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body.", errors: { body: "Request body must be valid JSON." } },
      { status: 400 },
    );
  }

  const result = validateAndCreateOrder(payload);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Validation failed. Please check the highlighted fields.", errors: result.errors },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      message: "Order confirmed",
      order: result.order,
      receipt: {
        orderId: result.order.id,
        status: result.order.status,
        placedAt: result.order.createdAt,
        items: result.order.items,
        subtotal: result.order.subtotal,
        discount: result.order.discount,
        total: result.order.total,
        promoCode: result.order.promoCode,
        freeDelivery: result.order.freeDelivery,
      },
    },
    { status: 201 },
  );
}
