"use client";

import Link from "next/link";
import { useState } from "react";

type Tab = "pending" | "active";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100";

const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-slate-700";

const linkClass = "font-semibold text-blue-700 hover:underline";

// Simple inline icons so no extra packages are needed
function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
  clock: "M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z",
  check: "M9 12l2 2 4-4M12 22a10 10 0 100-20 10 10 0 000 20z",
  building: "M4 21V3h10v18M14 9h6v12M8 7h2M8 11h2M8 15h2M4 21h16",
  doc: "M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5zM14 3v5h5M9 13h6M9 17h6",
  arrow: "M5 12h14M13 6l6 6-6 6",
  filter: "M3 5h18l-7 8v6l-4-2v-4L3 5z",
  download: "M12 3v12M7 10l5 5 5-5M4 21h16",
};

export default function PartnerHubPage() {
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [sortOrder, setSortOrder] = useState("high-to-low");
  const [minFit, setMinFit] = useState("");
  const [maxFit, setMaxFit] = useState("");
  const [tab, setTab] = useState<Tab>("active");

  // Placeholder numbers, replace with real data later
  const stats = [
    { label: "Total Applications", value: 0, icon: ICONS.trend },
    { label: "Pending Review", value: 0, icon: ICONS.clock },
    { label: "Active Investors", value: 0, icon: ICONS.check },
    { label: "Active Service Providers", value: 0, icon: ICONS.building },
  ];
  const pendingCount = 0;
  const activeCount = 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 px-6 py-10 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
            ScaleupMap Hub
          </p>
          <h1 className="mt-3 font-serif text-4xl text-slate-900 sm:text-5xl">
            Partner Hub (Investors and Service Providers)
          </h1>
          <p className="mt-3 text-slate-500">
            Manage your investors and service providers.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10 sm:px-12">
        {/* Fundraise Management Tools */}
        <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-700 text-white">
              <Icon path={ICONS.doc} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Fundraise Management Tools
              </h2>
              <p className="text-sm text-slate-500">
                Check out our built-in tools for an easy fundraise process
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <p>
              Visit the{" "}
              <Link href="/progress-updates" className={linkClass}>
                Progress Updates
              </Link>{" "}
              page to send updates to your investors—whether they&apos;re on or
              off the ScaleupMap platform. Create professional investor updates
              easily with our{" "}
              <Link href="/progress-updates/ai" className={linkClass}>
                AI assistance
              </Link>{" "}
              or use our{" "}
              <Link href="/progress-updates/template" className={linkClass}>
                custom template
              </Link>{" "}
              to craft them manually. Investor updates can reference files from
              your secure dataroom.
            </p>
            <p>
              Create a{" "}
              <Link href="/dataroom" className={linkClass}>
                Secure dataroom
              </Link>{" "}
              to store and share confidential documents with your investors.
              Files uploaded to your dataroom can be referenced in investor
              updates.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/progress-updates"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-sky-400 to-blue-700 px-4 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              <Icon path={ICONS.doc} />
              Go to Progress Updates
              <Icon path={ICONS.arrow} />
            </Link>
            <Link
              href="/dataroom"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-700 bg-white px-4 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
            >
              Go to Secure Dataroom
              <Icon path={ICONS.arrow} />
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-sm text-slate-600">{s.label}</p>
                <p className="mt-1 text-3xl font-bold text-blue-800">
                  {s.value}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-100 text-blue-700">
                <Icon path={s.icon} />
              </div>
            </div>
          ))}
        </section>

        {/* Filter & Sort */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Icon path={ICONS.filter} />
            Filter &amp; Sort Affiliates
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className={labelClass}>
              Type
              <select
                className={inputClass}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="investor">Investors</option>
                <option value="service-provider">Service Providers</option>
              </select>
            </label>

            <label className={labelClass}>
              Sort By
              <select
                className={inputClass}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="fit-score">Fit Score</option>
                <option value="name">Name</option>
              </select>
            </label>

            <label className={labelClass}>
              Sort Order
              <select
                className={inputClass}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="high-to-low">High to Low</option>
                <option value="low-to-high">Low to High</option>
              </select>
            </label>

            <label className={labelClass}>
              Min Fit Score
              <input
                type="number"
                min={0}
                max={10}
                placeholder="0"
                className={inputClass}
                value={minFit}
                onChange={(e) => setMinFit(e.target.value)}
              />
            </label>

            <label className={labelClass}>
              Max Fit Score
              <input
                type="number"
                min={0}
                max={10}
                placeholder="10"
                className={inputClass}
                value={maxFit}
                onChange={(e) => setMaxFit(e.target.value)}
              />
            </label>
          </div>
        </section>

        {/* Export */}
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Icon path={ICONS.download} />
            Export to Excel
          </button>
        </div>

        {/* Tabs */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div
            role="tablist"
            className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1"
          >
            {(
              [
                { id: "pending", label: "Pending Applications", count: pendingCount },
                { id: "active", label: "Active Partners", count: activeCount },
              ] as const
            ).map((t) => {
              const selected = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${
                    selected
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                  <span className="rounded-full bg-sky-400 px-2 py-0.5 text-xs font-semibold text-white">
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="px-2 py-12 text-center text-sm text-slate-500">
            {tab === "pending"
              ? "No pending applications."
              : "No active partners."}
          </div>
        </section>
      </main>
    </div>
  );
}