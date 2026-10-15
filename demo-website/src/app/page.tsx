"use client";

import Image from "next/image";
import Link from "next/link";
import { signOutUser, useAuth } from "@/lib/useAuth";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-1 flex-col bg-bg-landing font-landing">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/Scaleup-icon.png"
            alt="ScaleUp Map logo"
            width={32}
            height={32}
            priority
          />
          <span className="font-heading text-xl text-title">ScaleUp Map</span>
        </Link>

        <nav className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => signOutUser()}
                className="rounded-full border border-brand/25 px-5 py-2 text-sm font-medium text-brand transition-colors hover:border-brand/50"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-light">
          ScaleUp Map
        </p>

        <h1 className="max-w-2xl font-heading text-5xl leading-tight text-headline sm:text-6xl">
          Map every question on your scale-up journey
        </h1>

        <div
          aria-hidden
          className="h-1 w-24 rounded-full bg-gradient-to-r from-brand-light to-brand"
        />

        <p className="max-w-xl text-lg leading-8 text-body">
          Capture the questions that matter, record the answers you discover,
          and watch your personal knowledge map grow — all in one place, private
          to you.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="flex h-12 items-center justify-center rounded-full bg-brand px-8 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            {user ? "Open your dashboard" : "Get started"}
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full border border-brand/25 px-8 text-sm font-medium text-brand transition-colors hover:border-brand/50"
          >
            Sign in
          </Link>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-center text-sm text-meta">
        Built for the ScaleUp Map hackathon.
      </footer>
    </div>
  );
}
