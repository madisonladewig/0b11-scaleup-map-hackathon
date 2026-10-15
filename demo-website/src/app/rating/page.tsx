import Link from "next/link";

interface CategoryConfig {
  label: string;
  score: string;       // placeholder, replace with a real value later
  buttonLabel: string; // change the button text here
  href: string;        // change where the button goes here
}

const CATEGORIES: CategoryConfig[] = [
  { label: "Overall Score", score: "3", buttonLabel: "Partner Hub", href: "/overall" },
  { label: "Leading Competitor Score", score: "5", buttonLabel: "Venture Settings", href: "/competitors" },
  { label: "AI Confidence", score: "2", buttonLabel: "Investment Memo", href: "/ai-confidence" },
  { label: "VC Fundability Score", score: "4", buttonLabel: "Subscriber Manager", href: "/fundability" },
];

export default function ScoreResults() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        Your ScaleupMap Score
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map(({ label, score, buttonLabel, href }) => (
          <div
            key={label}
            className="flex flex-col items-start gap-3 rounded-xl border border-black/10 p-5 dark:border-white/20"
          >
            <h2 className="text-lg font-medium">{label}</h2>
            <p className="text-4xl font-bold">{score}</p>
            <Link
              href={"/navigate"}
              className="mt-auto rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-80"
            >
              {buttonLabel}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
