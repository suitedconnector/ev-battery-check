/**
 * Cloudflare Pages Function — lead sink.
 *
 * Static-export builds have no Next server runtime, so lead submissions land
 * here. Same path (/api/lead), same payload shape as lib/types.ts LeadPayload,
 * same response contract. Later, replace the console.log with a DB insert /
 * CRM call / provider webhook keyed on `providerId` so leads can be routed to
 * different providers.
 *
 * The payload shape is re-declared here (kept identical to lib/types.ts) so the
 * Function stays self-contained and free of Next path aliases.
 */

interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  location: string;
  vehicle: { make: string; model: string };
  year: number | "";
  mileage: number | "";
  symptoms: string[];
  rangeRetention?: number;
  quoteAmount?: number;
  vehicleValue?: number;
  warrantyStatus: string;
  assessment: string;
  providerId: string;
  timestamp: string;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context: {
  request: Request;
}): Promise<Response> {
  let body: Partial<LeadPayload>;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Minimal server-side validation — never trust the client.
  if (!body.name || !body.email) {
    return json({ ok: false, error: "missing_required_fields" }, 400);
  }

  const lead: LeadPayload = {
    name: String(body.name),
    email: String(body.email),
    phone: body.phone ? String(body.phone) : undefined,
    location: body.location ? String(body.location) : "",
    vehicle: {
      make: body.vehicle?.make ?? "",
      model: body.vehicle?.model ?? "",
    },
    year: body.year ?? "",
    mileage: body.mileage ?? "",
    symptoms: Array.isArray(body.symptoms) ? body.symptoms.map(String) : [],
    rangeRetention: body.rangeRetention,
    quoteAmount: body.quoteAmount,
    vehicleValue: body.vehicleValue,
    warrantyStatus: body.warrantyStatus ? String(body.warrantyStatus) : "",
    assessment: body.assessment ? String(body.assessment) : "not-enough-info",
    providerId: body.providerId ? String(body.providerId) : "unassigned",
    timestamp: body.timestamp ?? new Date().toISOString(),
  };

  console.log("[lead] received", JSON.stringify(lead));

  return json({ ok: true }, 200);
}
