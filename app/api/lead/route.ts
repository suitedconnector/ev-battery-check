import { NextResponse } from "next/server";
import type { LeadPayload } from "@/lib/types";

/**
 * MVP lead sink.
 *
 * For now this validates the minimum, logs the structured payload
 * server-side, and returns success. The payload shape (LeadPayload) is the
 * contract — later, replace the console.log with a DB insert / CRM call /
 * provider webhook keyed on `providerId`.
 */
export async function POST(request: Request) {
  let body: Partial<LeadPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Minimal server-side validation — never trust the client.
  if (!body.name || !body.email || !body.consent) {
    return NextResponse.json(
      { ok: false, error: "missing_required_fields" },
      { status: 422 }
    );
  }

  const lead: LeadPayload = {
    name: String(body.name),
    email: String(body.email),
    phone: body.phone ? String(body.phone) : undefined,
    zip: body.zip ? String(body.zip) : "",
    vehicle: {
      make: body.vehicle?.make ?? "",
      model: body.vehicle?.model ?? "",
      year: body.vehicle?.year ?? "",
    },
    problem: body.problem ?? "",
    assessmentCategory: body.assessmentCategory ?? "not-enough-info",
    description: body.description ? String(body.description) : "",
    consent: Boolean(body.consent),
    providerId: body.providerId ? String(body.providerId) : "unknown",
    submittedAt: body.submittedAt ?? new Date().toISOString(),
  };

  // eslint-disable-next-line no-console
  console.log("[lead] received", JSON.stringify(lead));

  return NextResponse.json({ ok: true });
}
