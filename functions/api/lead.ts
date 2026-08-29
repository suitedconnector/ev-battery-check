/**
 * Cloudflare Pages Function — lead sink.
 *
 * Replaces the former Next.js API route (app/api/lead/route.ts), which cannot
 * run under a static export. Same path (/api/lead), same payload shape, same
 * response contract. Later, swap the console.log for a DB insert / CRM call /
 * provider webhook keyed on `providerId`.
 *
 * The LeadPayload shape is re-declared here (kept identical to lib/types.ts)
 * so the Function stays self-contained and free of Next path aliases.
 */

interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  zip: string;
  vehicle: {
    make: string;
    model: string;
    year: number | "";
  };
  problem: string;
  assessmentCategory: string;
  description: string;
  consent: boolean;
  providerId: string;
  submittedAt: string;
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
  if (!body.name || !body.email || !body.consent) {
    return json({ ok: false, error: "missing_required_fields" }, 400);
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

  console.log("[lead] received", JSON.stringify(lead));

  return json({ ok: true }, 200);
}
