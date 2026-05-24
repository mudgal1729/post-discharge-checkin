"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type Patient = Doc<"patients">;

export default function Home() {
  const patients = useQuery(api.patients.list);
  const initiateCall = useAction(api.calls.initiateCall);
  const [busyId, setBusyId] = useState<Id<"patients"> | null>(null);
  const [statusById, setStatusById] = useState<Record<string, string>>({});

  const sharma = patients?.find((p) => p.demo_label === "stable");
  const kumar = patients?.find((p) => p.demo_label === "red_flag");

  const call = async (patient: Patient) => {
    setBusyId(patient._id);
    setStatusById((s) => ({
      ...s,
      [patient._id]: `Calling ${patient.name.split(" ")[0]}… pick up your phone.`,
    }));
    try {
      await initiateCall({ patient_id: patient._id });
      setStatusById((s) => ({
        ...s,
        [patient._id]: `Call initiated to ${patient.name}. Pick up your phone.`,
      }));
    } catch (e) {
      setStatusById((s) => ({
        ...s,
        [patient._id]: `Error: ${e instanceof Error ? e.message : String(e)}`,
      }));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="bg-white text-slate-900">
      {/* Screen 1 — Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 py-32 text-center overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" aria-hidden />

        {/* Live badge */}
        <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
          </span>
          <span className="text-sm font-semibold text-blue-700 tracking-wide uppercase">
            Live demo
          </span>
        </div>

        <h1 className="relative mt-8 text-8xl md:text-9xl font-bold tracking-tight text-slate-900">
          AfterCare
        </h1>
        <p className="relative mt-6 text-3xl text-slate-700 font-medium max-w-4xl">
          An AI{" "}
          <span className="text-blue-600 underline decoration-blue-300 decoration-4 underline-offset-8">
            voice nurse
          </span>{" "}
          for post-surgery patient check-ins.
        </p>
        <p className="relative mt-12 text-2xl leading-relaxed text-slate-600 max-w-4xl">
          India's top hospital chains discharge over 2 million inpatients a
          year. Most don't get a structured follow-up call in the critical
          24-to-72-hour window, and the genuine red flags become ER visits days
          later. AfterCare closes that gap by running the routine check-ins
          automatically and escalating only the cases that need a nurse.
        </p>
        <div className="relative mt-20 text-3xl text-slate-300" aria-hidden>
          ↓
        </div>
      </section>

      {/* Screen 2 — What I built */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 py-32 bg-white">
        <div className="flex flex-col items-center">
          <h2 className="text-5xl md:text-6xl font-bold text-center text-slate-900">
            What I built
          </h2>
          <span className="mt-4 h-1 w-20 rounded-full bg-blue-600" aria-hidden />
        </div>

        <div className="mt-20 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-10 transition-transform hover:-translate-y-1">
            <div className="text-7xl md:text-8xl font-bold text-blue-600 tracking-tight">
              90<span className="text-4xl md:text-5xl text-blue-400">s</span>
            </div>
            <div className="mt-4 text-xl text-slate-700">per check-in</div>
          </div>
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-10 transition-transform hover:-translate-y-1">
            <div className="text-7xl md:text-8xl font-bold text-blue-600 tracking-tight">
              5
            </div>
            <div className="mt-4 text-xl text-slate-700">
              screening questions,<br />deterministic classifier
            </div>
          </div>
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-10 transition-transform hover:-translate-y-1">
            <div className="text-7xl md:text-8xl font-bold text-blue-600 tracking-tight">
              3
            </div>
            <div className="mt-4 text-xl text-slate-700">
              named outcomes:<br />stable, monitoring, escalate
            </div>
          </div>
        </div>

        <p className="mt-20 text-2xl italic text-slate-600 max-w-4xl text-center leading-relaxed">
          ElevenAgents orchestration on Twilio, Convex backend for state and
          tools, multi-voice tonal shift on red flags, Slack and Resend for
          nurse and patient comms.
        </p>
      </section>

      {/* Screen 3 — Live Demo */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex flex-col items-center">
          <h2 className="text-5xl md:text-6xl font-bold text-center text-slate-900 inline-flex items-center gap-4">
            Live Demo
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-sm font-semibold text-red-700 tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
              </span>
              Live
            </span>
          </h2>
          <span className="mt-4 h-1 w-20 rounded-full bg-blue-600" aria-hidden />
        </div>
        <p className="mt-6 text-2xl text-slate-600 text-center">
          Two patients. Day 3 post-knee-replacement. Tap to call.
        </p>

        {patients === undefined && (
          <p className="mt-16 text-xl text-slate-500">Loading patients…</p>
        )}

        {patients && patients.length === 0 && (
          <p className="mt-16 text-xl text-amber-700">
            No patients seeded. Run{" "}
            <code className="px-2 py-1 bg-slate-200 rounded">
              npx convex run patients:seed
            </code>
            .
          </p>
        )}

        {patients && patients.length > 0 && (
          <div className="mt-16 flex flex-col md:flex-row gap-8 w-full max-w-5xl">
            {[sharma, kumar].filter(Boolean).map((p) => {
              const patient = p as Patient;
              const isStable = patient.demo_label === "stable";
              const status = statusById[patient._id];
              return (
                <div
                  key={patient._id}
                  className="flex-1 bg-white border border-slate-200 rounded-2xl p-10 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-4xl font-bold text-slate-900">
                        {patient.name}
                      </h3>
                      <p className="mt-2 text-xl text-slate-600">
                        {patient.procedure}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                        isStable
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {isStable ? "Stable" : "Red flag"}
                    </span>
                  </div>
                  <p className="mt-3 text-lg text-blue-600 font-semibold">
                    Day {patient.day_of_recovery} post-discharge
                  </p>

                  <button
                    onClick={() => call(patient)}
                    disabled={busyId !== null}
                    className="mt-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-2xl px-10 py-6 rounded-xl font-semibold transition-colors shadow-sm"
                  >
                    {busyId === patient._id
                      ? `Calling ${patient.name.split(" ")[0]}…`
                      : `Call ${patient.name}`}
                  </button>

                  <p className="mt-4 text-sm text-slate-500">
                    {isStable
                      ? "Expected: stable → email confirmation"
                      : "Expected: red flag → Slack escalation to on-call nurse"}
                  </p>

                  {status && (
                    <p className="mt-4 text-base text-slate-700 break-words">
                      {status}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-400 bg-white border-t border-slate-100">
        Built in 3 hours. Demo only. Not for clinical use.
      </footer>
    </main>
  );
}
