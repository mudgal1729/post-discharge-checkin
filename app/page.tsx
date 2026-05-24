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
    <main className="bg-neutral-950 text-white">
      {/* Screen 1 — Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 py-32 text-center">
        <h1 className="text-8xl md:text-9xl font-bold tracking-tight">AfterCare</h1>
        <p className="mt-6 text-3xl text-blue-400 max-w-4xl">
          An AI voice nurse for post-surgery patient check-ins.
        </p>
        <p className="mt-12 text-2xl leading-relaxed text-neutral-300 max-w-4xl">
          Hospital chains run 200,000+ post-discharge follow-up calls a year,
          handled manually by 10+ nurses on phones. Most are routine status
          confirmations. AfterCare takes the routine 80% off the queue,
          escalating only the genuine red flags to the on-call nurse, in real
          time.
        </p>
        <div className="mt-20 text-3xl text-neutral-600" aria-hidden>
          ↓
        </div>
      </section>

      {/* Screen 2 — Live Demo */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 py-32">
        <h2 className="text-5xl md:text-6xl font-bold text-center">Live Demo</h2>
        <p className="mt-6 text-2xl text-neutral-400 text-center">
          Two patients. Day 3 post-knee-replacement. Tap to call.
        </p>

        {patients === undefined && (
          <p className="mt-16 text-xl text-neutral-500">Loading patients…</p>
        )}

        {patients && patients.length === 0 && (
          <p className="mt-16 text-xl text-amber-400">
            No patients seeded. Run{" "}
            <code className="px-2 py-1 bg-neutral-900 rounded">
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
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-10 flex flex-col"
                >
                  <h3 className="text-4xl font-bold">{patient.name}</h3>
                  <p className="mt-2 text-xl text-neutral-400">
                    {patient.procedure}
                  </p>
                  <p className="mt-3 text-lg text-blue-400 font-medium">
                    Day {patient.day_of_recovery} post-discharge
                  </p>

                  <button
                    onClick={() => call(patient)}
                    disabled={busyId !== null}
                    className="mt-10 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white text-2xl px-10 py-6 rounded-xl font-semibold transition-colors"
                  >
                    {busyId === patient._id
                      ? `Calling ${patient.name.split(" ")[0]}…`
                      : `Call ${patient.name}`}
                  </button>

                  <p className="mt-4 text-sm text-neutral-500">
                    {isStable
                      ? "Expected: stable → email confirmation"
                      : "Expected: red flag → Slack escalation to on-call nurse"}
                  </p>

                  {status && (
                    <p className="mt-4 text-base text-neutral-300 break-words">
                      {status}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Screen 3 — What I built */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 py-32">
        <h2 className="text-5xl md:text-6xl font-bold text-center">
          What I built
        </h2>

        <div className="mt-20 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-7xl md:text-8xl font-bold text-blue-400">
              90s
            </div>
            <div className="mt-4 text-xl text-neutral-400">per check-in</div>
          </div>
          <div>
            <div className="text-7xl md:text-8xl font-bold text-blue-400">
              5
            </div>
            <div className="mt-4 text-xl text-neutral-400">
              screening questions, deterministic classifier
            </div>
          </div>
          <div>
            <div className="text-7xl md:text-8xl font-bold text-blue-400">
              3
            </div>
            <div className="mt-4 text-xl text-neutral-400">
              named outcomes: stable, monitoring, escalate
            </div>
          </div>
        </div>

        <p className="mt-20 text-2xl italic text-neutral-300 max-w-4xl text-center leading-relaxed">
          ElevenAgents orchestration on Twilio, Convex backend for state and
          tools, multi-voice tonal shift on red flags, Slack and Resend for
          nurse and patient comms.
        </p>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-neutral-600">
        Built in 3 hours. Demo only. Not for clinical use.
      </footer>
    </main>
  );
}
