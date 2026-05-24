import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("patients").collect();
  },
});

export const seed = mutation({
  args: { demo_phone: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("patients").collect();
    for (const p of existing) await ctx.db.delete(p._id);

    const sharma = await ctx.db.insert("patients", {
      name: "Geeta Sharma",
      phone: args.demo_phone,
      procedure: "Total knee replacement, right knee",
      procedure_date: "2026-05-21",
      day_of_recovery: 3,
      thromboprophylaxis: "Aspirin 150mg once daily",
      language: "English",
      demo_label: "stable",
    });

    const kumar = await ctx.db.insert("patients", {
      name: "Ramesh Kumar",
      phone: args.demo_phone,
      procedure: "Total knee replacement, left knee",
      procedure_date: "2026-05-21",
      day_of_recovery: 3,
      thromboprophylaxis: "Aspirin 150mg once daily",
      language: "English",
      demo_label: "red_flag",
    });

    return { sharma, kumar };
  },
});
