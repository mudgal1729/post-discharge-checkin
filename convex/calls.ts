import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

type InitiateCallResult = {
  ok: true;
  conversation_id: string | null;
  call_sid: string | null;
};

export const initiateCall = action({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args): Promise<InitiateCallResult> => {
    const patient: Doc<"patients"> | null = await ctx.runQuery(api.patients.getById, {
      id: args.patient_id,
    });
    if (!patient) throw new Error("Patient not found");

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const phoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID;
    if (!apiKey || !agentId || !phoneNumberId) {
      throw new Error("Missing ElevenLabs env vars (ELEVENLABS_API_KEY / ELEVENLABS_AGENT_ID / ELEVENLABS_PHONE_NUMBER_ID)");
    }

    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          agent_phone_number_id: phoneNumberId,
          to_number: patient.phone,
          conversation_initiation_client_data: {
            dynamic_variables: {
              patient_id: patient._id,
              first_name: patient.name.split(" ")[0],
              name: patient.name,
              patient_name: patient.name,
              patient_first_name: patient.name.split(" ")[0],
              procedure: patient.procedure,
              procedure_date: patient.procedure_date,
              day_of_recovery: String(patient.day_of_recovery),
              thromboprophylaxis: patient.thromboprophylaxis,
              patient_phone: patient.phone,
            },
          },
        }),
      }
    );

    const result = await response.json();
    if (!response.ok || result.success === false) {
      throw new Error(`ElevenLabs API error (${response.status}): ${JSON.stringify(result)}`);
    }

    return {
      ok: true,
      conversation_id: result.conversation_id ?? null,
      call_sid: result.callSid ?? null,
    };
  },
});
