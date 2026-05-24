export type ClassifyArgs = {
  pain_score: number;
  chest_symptoms: boolean;
  calf_symptoms: boolean;
  temperature_celsius: number | null;
  wound_concerning: boolean;
};

export type ClassifyResult = {
  outcome: "stable" | "monitoring" | "escalate";
  reason: string;
  priority: "low" | "medium" | "high";
};

export function classifyOutcome(args: ClassifyArgs): ClassifyResult {
  if (args.chest_symptoms) {
    return {
      outcome: "escalate",
      reason: "Chest pain or breathlessness reported — possible PE.",
      priority: "high",
    };
  }
  if (args.calf_symptoms) {
    return {
      outcome: "escalate",
      reason: "Calf pain or swelling — suspected DVT.",
      priority: "high",
    };
  }
  if (args.pain_score >= 8) {
    return {
      outcome: "escalate",
      reason: `Severe pain reported (${args.pain_score}/10).`,
      priority: "high",
    };
  }
  if (args.temperature_celsius !== null && args.temperature_celsius >= 38.3) {
    return {
      outcome: "escalate",
      reason: `Fever ${args.temperature_celsius}°C — possible infection.`,
      priority: "high",
    };
  }
  if (args.wound_concerning) {
    return {
      outcome: "escalate",
      reason: "Wound concerning: spreading redness, pus, or odor.",
      priority: "high",
    };
  }

  if (args.pain_score >= 6) {
    return {
      outcome: "monitoring",
      reason: `Pain ${args.pain_score}/10, partially controlled.`,
      priority: "medium",
    };
  }
  if (args.temperature_celsius !== null && args.temperature_celsius >= 37.8) {
    return {
      outcome: "monitoring",
      reason: `Low-grade fever ${args.temperature_celsius}°C.`,
      priority: "medium",
    };
  }

  return {
    outcome: "stable",
    reason: "All check-in values within expected range.",
    priority: "low",
  };
}
