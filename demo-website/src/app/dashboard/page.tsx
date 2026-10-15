"use client";

import { onValue, push, ref, serverTimestamp, update } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [question, setQuestion] = useState("");
  const [posting, setPosting] = useState(false);
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
    const unsubscribe = onValue(qaRef, (snapshot) => {
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
    return unsubscribe;
  }, [user]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !question.trim()) return;

    setError("");
    setPosting(true);
    try {
      const db = getFirebaseDb();
      await push(ref(db, `users/${user.uid}/qa`), {
        question: question.trim(),
        answer: null,
        createdAt: serverTimestamp(),
        answeredAt: null,
      });
      setQuestion("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save question");
    } finally {
      setPosting(false);
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
            Your knowledge map
          </p>
          <h1 className="mt-1 font-heading text-4xl text-title">
            Questions &amp; Answers
          </h1>
        </div>

        <section className="rounded-2xl border border-brand/12 bg-white p-6 shadow-sm">
          <form onSubmit={handleAsk} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-body">
                Ask a question
              </span>
              <textarea
                required
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="resize-none rounded-lg border border-brand/15 bg-white px-3 py-2 text-sm text-headline outline-none transition-colors focus:border-brand-light"
                placeholder="What do you need to figure out next?"
              />
            </label>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={posting || !question.trim()}
                className="flex h-10 items-center justify-center rounded-full bg-brand px-6 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                {posting ? "Saving…" : "Save question"}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <section className="flex flex-col gap-4">
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-brand/12 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-meta">
                No questions yet. Ask your first question above to start your
                map.
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-brand/12 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-4">
                  <div
                    aria-hidden
                    className="w-1 shrink-0 rounded-full bg-gradient-to-b from-brand-light to-brand"
                  />
                  <div className="flex flex-1 flex-col gap-3">
                    <h2 className="text-base font-semibold text-headline">
                      {entry.question}
                    </h2>

                    {entry.answer ? (
                      <div className="rounded-xl bg-bg-app px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-light">
                          Answer
                        </p>
                        <p className="mt-1 text-sm leading-6 text-body">
                          {entry.answer}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <textarea
                          rows={2}
                          value={answerDrafts[entry.id] ?? ""}
                          onChange={(e) =>
                            setAnswerDrafts((prev) => ({
                              ...prev,
                              [entry.id]: e.target.value,
                            }))
                          }
                          className="resize-none rounded-lg border border-brand/15 bg-white px-3 py-2 text-sm text-headline outline-none transition-colors focus:border-brand-light"
                          placeholder="Write your answer…"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleAnswer(entry.id)}
                            disabled={
                              savingAnswerId === entry.id ||
                              !(answerDrafts[entry.id] ?? "").trim()
                            }
                            className="flex h-9 items-center justify-center rounded-full border border-brand/25 px-5 text-sm font-medium text-brand transition-colors hover:border-brand/50 disabled:opacity-50"
                          >
                            {savingAnswerId === entry.id
                              ? "Saving…"
                              : "Save answer"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
