/**
 * Thin wrapper around Resend's REST API — plain fetch, no SDK dependency to
 * version-pin. Requires RESEND_API_KEY in your environment; until you have
 * one (and a verified sending domain), calls here will fail silently logged
 * to the server console rather than breaking checkout.
 *
 * RESEND_FROM_EMAIL should be something like "YAARANA <orders@yourdomain.com>"
 * once you've verified a domain in Resend. Until then it falls back to
 * Resend's own sandbox sender, which only delivers to the email address you
 * signed up to Resend with — fine for testing, not for real customers.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set — skipping send:", subject, "to", to);
    return { success: false, error: "Email service not configured yet" };
  }

  const from = process.env.RESEND_FROM_EMAIL || "YAARANA <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      const body = await res.text();
      let errorMsg = `Resend error (${res.status})`;
      try {
        const parsed = JSON.parse(body);
        errorMsg = parsed.message || parsed.error || body;
      } catch {
        errorMsg = body || errorMsg;
      }
      console.error(`[email] Resend API error (${res.status}):`, errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log(`[email] Successfully sent "${subject}" to ${to}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] send failed:", message);
    return { success: false, error: message };
  }
}