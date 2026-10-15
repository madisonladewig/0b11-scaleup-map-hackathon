"use client";

import { onValue, ref, serverTimestamp, set, update } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  type AssessmentAnswers,
  type AssessmentRecord,
  computeScores,
  generateDisplayScores,
  QUESTIONS,
} from "@/lib/assessment";
import { getFirebaseDb } from "@/lib/firebase";
import { signOutUser, useAuth } from "@/lib/useAuth";

type QaEntry = {
  id: string;
  question: string;
  answer: string | null;
  createdAt: number | null;
  answeredAt: number | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [entries, setEntries] = useState<QaEntry[]>([]);
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    journey: null,
    hardest: null,
    stage: null,
    pitchDeck: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [savingAnswerId, setSavingAnswerId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    const db = getFirebaseDb();
    const qaRef = ref(db, `users/${user.uid}/qa`);
    const unsubscribeQa = onValue(qaRef, (snapshot) => {
      const value = snapshot.val() as Record<
        string,
        Omit<QaEntry, "id">
      > | null;
      const list: QaEntry[] = value
        ? Object.entries(value)
            .map(([id, entry]) => ({
              id,
              question: entry.question,
              answer: entry.answer ?? null,
              createdAt: entry.createdAt ?? null,
              answeredAt: entry.answeredAt ?? null,
            }))
            .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
        : [];
      setEntries(list);
    });

    const assessmentRef = ref(db, `users/${user.uid}/assessment`);
    const unsubscribeAssessment = onValue(assessmentRef, (snapshot) => {
      const value = snapshot.val() as AssessmentRecord | null;
      setAssessment(value);
      if (value) {
        setAnswers({
          journey: value.journey ?? null,
          hardest: value.hardest ?? null,
          stage: value.stage ?? null,
          pitchDeck: value.pitchDeck ?? null,
        });
      }
    });

    return () => {
      unsubscribeQa();
      unsubscribeAssessment();
    };
  }, [user]);

  const allAnswered = useMemo(
    () => QUESTIONS.every((q) => answers[q.id] !== null),
    [answers],
  );

  async function handleSubmitAssessment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !allAnswered) return;

    setError("");
    setSubmitting(true);
    try {
      const db = getFirebaseDb();
      const computed = computeScores(answers);
      const displayScores = generateDisplayScores();
      await set(ref(db, `users/${user.uid}/assessment`), {
        journey: answers.journey,
        hardest: answers.hardest,
        stage: answers.stage,
        pitchDeck: answers.pitchDeck,
        scores: computed,
        displayScores,
        updatedAt: serverTimestamp(),
      });
      router.push("/recommendation");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to save assessment",
      );
      setSubmitting(false);
    }
  }

  async function handleAnswer(id: string) {
    if (!user) return;
    const draft = answerDrafts[id]?.trim();
    if (!draft) return;

    setError("");
    setSavingAnswerId(id);
    try {
      const db = getFirebaseDb();
      await update(ref(db, `users/${user.uid}/qa/${id}`), {
        answer: draft,
        answeredAt: serverTimestamp(),
      });
      setAnswerDrafts((prev) => ({ ...prev, [id]: "" }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save answer");
    } finally {
      setSavingAnswerId(null);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg-app font-landing">
        <p className="text-sm text-meta">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-bg-app font-landing">
      <header className="border-b border-brand/10 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
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
            {assessment && (
              <Link
                href="/recommendation"
                className="rounded-full border border-brand/25 px-4 py-1.5 text-sm font-medium text-brand transition-colors hover:border-brand/50"
              >
                View recommendation
              </Link>
            )}
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

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-light">
            Your Venture Intelligence
          </p>
          <h1 className="mt-1 font-heading text-4xl text-title">
            Founder Assessment
          </h1>
          <p className="mt-2 text-sm text-body">
            Answer four quick questions and we'll map your scores and point you
            at the most useful advice next.
          </p>
        </div>

        <section className="rounded-2xl border border-brand/12 bg-white p-6 shadow-sm">
          <form
            onSubmit={handleSubmitAssessment}
            className="flex flex-col gap-8"
          >
            {QUESTIONS.map((question, qi) => (
              <fieldset key={question.id} className="flex flex-col gap-3">
                <legend className="text-base font-semibold text-headline">
                  <span className="mr-2 text-brand-light">{qi + 1}.</span>
                  {question.title}
                </legend>
                <p className="text-xs text-meta">Select one.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                          selected
                            ? "border-brand bg-brand/5 text-headline"
                            : "border-brand/15 bg-white text-body hover:bg-bg-app"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={selected}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [question.id]: option.id,
                            }))
                          }
                          className="h-4 w-4 accent-brand"
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !allAnswered}
                className="flex h-10 items-center justify-center rounded-full bg-brand px-6 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                {submitting
                  ? "Saving…"
                  : assessment
                    ? "Update my recommendation"
                    : "Get my recommendation"}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
