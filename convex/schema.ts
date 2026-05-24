import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  patients: defineTable({
    name: v.string(),
    phone: v.string(),
    procedure: v.string(),
    procedure_date: v.string(),
    day_of_recovery: v.number(),
    thromboprophylaxis: v.string(),
    language: v.string(),
    demo_label: v.string(),
  }).index("by_phone", ["phone"]),
  check_ins: defineTable({
    patient_id: v.id("patients"),
    started_at: v.string(),
    completed_at: v.optional(v.string()),
    outcome: v.optional(v.string()),
  }).index("by_patient", ["patient_id"]),
  symptom_logs: defineTable({
    check_in_id: v.id("check_ins"),
    question_id: v.string(),
    response_text: v.string(),
    severity: v.optional(v.number()),
    logged_at: v.string(),
  }).index("by_check_in", ["check_in_id"]),
  escalations: defineTable({
    patient_id: v.id("patients"),
    check_in_id: v.optional(v.id("check_ins")),
    reason: v.string(),
    priority: v.string(),
    created_at: v.string(),
    slack_sent: v.boolean(),
  }).index("by_patient", ["patient_id"]),
});
