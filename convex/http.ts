import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { classifyOutcome } from "./classify";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

http.route({
  path: "/getPatientContext",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const patientIdStr = url.searchParams.get("patient_id");
    const phone = url.searchParams.get("patient_phone");

    let patient = null;
    if (patientIdStr) {
      patient = await ctx.runQuery(api.patients.getById, {
        id: patientIdStr as Id<"patients">,
      });
    }
    if (!patient && phone) {
      patient = await ctx.runQuery(api.patients.getByPhone, { phone });
    }
    if (!patient) {
      return jsonResponse(
        { error: "patient not found", patient_id: patientIdStr, phone },
        404
      );
    }

    return jsonResponse({
      name: patient.name,
      first_name: patient.name.split(" ")[0],
      procedure: patient.procedure,
      day_of_recovery: patient.day_of_recovery,
      thromboprophylaxis: patient.thromboprophylaxis,
    });
  }),
});

http.route({
  path: "/logSymptomResponse",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const question_id = url.searchParams.get("question_id");
    const severityRaw = url.searchParams.get("severity");
    const severity =
      severityRaw != null && severityRaw !== "" && !isNaN(Number(severityRaw))
        ? Number(severityRaw)
        : undefined;

    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
    const response_text = (body.response_text as string | undefined) ?? "";

    // Demo: no-op persist (no active check_in row). Echo back for debugging.
    return jsonResponse({ ok: true, question_id, severity, response_text });
  }),
});

http.route({
  path: "/classifyOutcome",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const body = (await request.json()) as Record<string, unknown>;

    const rawTemp = body.temperature_celsius;
    let temp: number | null = null;
    if (rawTemp != null && rawTemp !== "" && rawTemp !== "null") {
      const n = Number(rawTemp);
      if (!isNaN(n)) temp = n;
    }

    const result = classifyOutcome({
      pain_score: Number(body.pain_score),
      chest_symptoms: Boolean(body.chest_symptoms),
      calf_symptoms: Boolean(body.calf_symptoms),
      temperature_celsius: temp,
      wound_concerning: Boolean(body.wound_concerning),
    });
    return jsonResponse(result);
  }),
});

http.route({
  path: "/escalateToNurse",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const patient_name = String(body.patient_name ?? "Unknown patient");
    const procedure = String(body.procedure ?? "Unknown procedure");
    const day_of_recovery = body.day_of_recovery ?? "?";
    const reason = String(body.reason ?? "No reason provided");
    const priority = String(body.priority ?? "high").toUpperCase();

    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) {
      return jsonResponse({ ok: false, error: "SLACK_WEBHOOK_URL missing" }, 500);
    }

    const istTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const message = {
      text: `🚨 *RED FLAG ESCALATION*\n*Patient:* ${patient_name}\n*Procedure:* ${procedure} (Day ${day_of_recovery})\n*Reason:* ${reason}\n*Priority:* ${priority}\n*Time:* ${istTime} IST`,
    };

    const slackRes = await fetch(slackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!slackRes.ok) {
      const txt = await slackRes.text();
      return jsonResponse(
        { ok: false, error: `Slack post failed (${slackRes.status}): ${txt}` },
        502
      );
    }

    return jsonResponse({ ok: true, posted_at: istTime });
  }),
});

http.route({
  path: "/scheduleNextCheckin",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const patient_name = String(body.patient_name ?? "Patient");
    const days_offset = Number(body.days_offset ?? 4);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days_offset);
    const formatted = nextDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Asia/Kolkata",
    });

    const resendKey = process.env.RESEND_API_KEY;
    const demoEmail = process.env.DEMO_EMAIL;
    if (!resendKey || !demoEmail) {
      return jsonResponse(
        { ok: false, error: "RESEND_API_KEY or DEMO_EMAIL missing" },
        500
      );
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Hope Hospital <onboarding@resend.dev>",
        to: demoEmail,
        subject: `Your next check-in is scheduled, ${patient_name}`,
        html: `<p>Hi ${patient_name},</p><p>Your next post-discharge check-in is scheduled for <strong>${formatted}</strong>. We'll call you at the usual time.</p><p>If anything changes before then, call the Hope Hospital helpline.</p><p>Take care,<br>Parul, Hope Hospital care team</p>`,
      }),
    });

    if (!emailRes.ok) {
      const txt = await emailRes.text();
      return jsonResponse(
        { ok: false, error: `Resend failed (${emailRes.status}): ${txt}` },
        502
      );
    }

    return jsonResponse({ ok: true, scheduled_for: formatted });
  }),
});

export default http;
