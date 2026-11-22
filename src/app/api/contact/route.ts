import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const errors: Record<string, string> = {};

  if (name.length < 2) errors.name = "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";
  if (message.length < 10) errors.message = "Please write at least 10 characters so we can help.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "Validation failed.", errors },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      message: "Thanks for reaching out! We reply within one working day.",
      reference: `PV-MSG-${Date.now().toString(36).toUpperCase()}`,
    },
    { status: 201 },
  );
}
