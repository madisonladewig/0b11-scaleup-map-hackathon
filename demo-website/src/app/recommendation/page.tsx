"use client";

import { onValue, ref } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type AssessmentRecord,
  type Band,
  bandFor,
  DISPLAY_CATEGORY_LABELS,
  type DisplayCategory,
  RECOMMENDATIONS,
} from "@/lib/assessment";
import { getFirebaseDb } from "@/lib/firebase";
import { signOutUser, useAuth } from "@/lib/useAuth";

const BAND_LABELS: Record<Band, string> = {
  low: "Needs work",
  mid: "Getting there",
  high: "Strong",
};

const BAND_CHIP_CLASSES: Record<Band, string> = {
  low: "border-red-200 bg-red-50 text-red-700",
  mid: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const CATEGORY_ORDER: DisplayCategory[] = [
  "overallConfidence",
  "vcFundabilityScore",
  "leadingCompetitorScore",
  "aiConfidence",
];

export default function RecommendationPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const db = getFirebaseDb();
    const assessmentRef = ref(db, `users/${user.uid}/assessment`);
    const unsubscribe = onValue(assessmentRef, (snapshot) => {
      const value = snapshot.val() as AssessmentRecord | null;
      setAssessment(value);
      setFetched(true);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (fetched && !assessment) {
      router.replace("/dashboard");
    }
  }, [fetched, assessment, router]);

  if (loading || !user || !fetched || !assessment) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg-app font-landing">
        <p className="text-sm text-meta">Loading…</p>
      </div>
    );
  }

  const { displayScores } = assessment;

  return (
    <div className="flex flex-1 flex-col bg-bg-app font-landing">
      <header className="border-b border-brand/10 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/Scaleup-icon.png"
              alt="ScaleUp Map logo"
              width={28}
              height={28}
              priority
            />
            <span className="font-heading text-lg text-title">ScaleUp Map</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-full border border-brand/25 px-4 py-1.5 text-sm font-medium text-brand transition-colors hover:border-brand/50"
            >
              Back to dashboard
            </Link>
            <span className="hidden text-sm text-meta sm:block">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => signOutUser()}
              className="rounded-full border border-brand/25 px-4 py-1.5 text-sm font-medium text-brand transition-colors hover:border-brand/50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-light">
            Your Venture Intelligence
          </p>
          <h1 className="mt-1 font-heading text-4xl text-title">
            Your Recommendation
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-body">
            Four signals, scored out of 100. Below each one: what it means at
            your current band, and the highest-leverage moves to push it up.
          </p>
        </div>

        <section className="grid gap-6 sm:grid-cols-2">
          {CATEGORY_ORDER.map((category) => {
            const score = displayScores[category];
            const band = bandFor(score);
            const rec = RECOMMENDATIONS[category][band];
            return (
              <article
                key={category}
                className="overflow-hidden rounded-2xl border border-brand/12 bg-white shadow-sm"
              >
                <div
                  aria-hidden
                  className="h-1 w-full bg-gradient-to-r from-brand-light to-brand"
                />
                <div className="flex flex-col gap-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-light">
                        {DISPLAY_CATEGORY_LABELS[category]}
                      </p>
                      <p className="mt-2 font-heading text-5xl text-title">
                        {score}
                        <span className="ml-1 text-xl text-meta">/ 100</span>
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${BAND_CHIP_CLASSES[band]}`}
                    >
                      {BAND_LABELS[band]}
                    </span>
                  </div>

                  <div
                    aria-hidden
                    className="h-2 w-full overflow-hidden rounded-full bg-bg-app"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-light to-brand transition-[width]"
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <div className="mt-2 flex flex-col gap-3 border-t border-brand/10 pt-4">
                    <h2 className="text-base font-semibold text-headline">
                      {rec.title}
                    </h2>
                    <p className="text-sm leading-6 text-body">
                      {rec.description}
                    </p>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-light">
                        How to improve
                      </p>
                      <ul className="mt-2 flex flex-col gap-2">
                        {rec.improvements.map((tip) => (
                          <li
                            key={tip}
                            className="flex gap-2 text-sm leading-6 text-body"
                          >
                            <span
                              aria-hidden
                              className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                            />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-light">
                        Further reading
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {rec.links.map((link) => (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              className="text-sm font-medium text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:text-brand-hover"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <div className="flex justify-center pb-6">
          <Link
            href="/dashboard"
            className="flex h-10 items-center justify-center rounded-full border border-brand/25 px-6 text-sm font-medium text-brand transition-colors hover:border-brand/50"
          >
            Retake the assessment
          </Link>
        </div>
      </main>
    </div>
  );
}
