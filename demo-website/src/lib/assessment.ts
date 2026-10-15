export type Category = "overall" | "leadingCompetitor" | "fundability";

export type Weights = Record<Category, number>;

export type Option = {
    id: string;
    label: string;
    weights: Weights;
};

export type Question = {
    id: "journey" | "hardest" | "stage" | "pitchDeck";
    title: string;
    options: readonly Option[];
};

export type Scores = Record<Category, number>;

export type AssessmentAnswers = Record<Question["id"], string | null>;

export type DisplayScores = {
    overallConfidence: number;
    vcFundabilityScore: number;
    leadingCompetitorScore: number;
    aiConfidence: number;
};

export type AssessmentRecord = {
    journey: string;
    hardest: string;
    stage: string;
    pitchDeck: string;
    scores: Scores;
    displayScores: DisplayScores;
    updatedAt: number | null;
};

const w = (
    overall: number,
    leadingCompetitor: number,
    fundability: number,
): Weights => ({ overall, leadingCompetitor, fundability });

export const QUESTIONS: readonly Question[] = [
    {
        id: "journey",
        title: "Where are you in your founder journey?",
        options: [
            {
                id: "looking-for-idea",
                label: "Looking for an idea",
                weights: w(0, 3, 0),
            },
            { id: "building-mvp", label: "Building an MVP", weights: w(1, 2, 2) },
            { id: "early-traction", label: "Early traction", weights: w(2, 1, 2) },
            {
                id: "raising-first-round",
                label: "Raising a first round",
                weights: w(2, 1, 2),
            },
            {
                id: "scaling-after-seed",
                label: "Scaling after seed",
                weights: w(2, 2, 2),
            },
            { id: "pivoting", label: "Pivoting", weights: w(0, 3, 1) },
        ],
    },
    {
        id: "hardest",
        title: "What's hardest right now?",
        options: [
            {
                id: "unsure-direction",
                label: "Unsure about direction",
                weights: w(0, 3, 0),
            },
            {
                id: "traction-customers",
                label: "Traction and customers",
                weights: w(2, 1, 3),
            },
            {
                id: "raising-overwhelming",
                label: "Raising feels overwhelming",
                weights: w(1, 3, 0),
            },
            {
                id: "finding-investors",
                label: "Finding investors and funding",
                weights: w(1, 3, 3),
            },
            {
                id: "blind-spots",
                label: "Blind spots investors will see",
                weights: w(1, 2, 2),
            },
            { id: "weekly-focus", label: "Need weekly focus", weights: w(2, 0, 3) },
        ],
    },
    {
        id: "stage",
        title: "What stage of start-up are you?",
        options: [
            { id: "idea", label: "Idea / Concept", weights: w(1, 3, 1) },
            { id: "pre-seed", label: "Pre-Seed", weights: w(2, 3, 2) },
            { id: "seed", label: "Seed", weights: w(2, 3, 3) },
            { id: "a", label: "Series A", weights: w(2, 3, 3) },
            { id: "b", label: "Series B", weights: w(2, 2, 3) },
            { id: "c", label: "Series C", weights: w(2, 2, 3) },
            { id: "d", label: "Series D", weights: w(3, 1, 3) },
        ],
    },
    {
        id: "pitchDeck",
        title: "Have you imported your pitch deck?",
        options: [
            { id: "not-yet", label: "Not yet", weights: w(0, 0, 0) },
            { id: "drafted", label: "Drafted", weights: w(1, 1, 1) },
            {
                id: "imported",
                label: "Imported & reviewed",
                weights: w(3, 1, 2),
            },
        ],
    },
];

export const CATEGORY_LABELS: Record<Category, string> = {
    overall: "Overall",
    leadingCompetitor: "Leading Competitor",
    fundability: "Fundability",
};

export const CATEGORY_MAX: Record<Category, number> = {
    overall: 10,
    leadingCompetitor: 10,
    fundability: 11,
};

export function computeScores(answers: AssessmentAnswers): Scores {
    const totals: Scores = { overall: 0, leadingCompetitor: 0, fundability: 0 };
    for (const question of QUESTIONS) {
        const selectedId = answers[question.id];
        if (!selectedId) continue;
        const option = question.options.find((o) => o.id === selectedId);
        if (!option) continue;
        totals.overall += option.weights.overall;
        totals.leadingCompetitor += option.weights.leadingCompetitor;
        totals.fundability += option.weights.fundability;
    }
    return totals;
}

export function generateDisplayScores(): DisplayScores {
    const r = () => Math.floor(Math.random() * 101);
    const overallConfidence = r();
    const vcFundabilityScore = r();
    const leadingCompetitorScore = r();
    const aiConfidence = Math.round(
        (overallConfidence + vcFundabilityScore + leadingCompetitorScore) / 3,
    );
    return {
        overallConfidence,
        vcFundabilityScore,
        leadingCompetitorScore,
        aiConfidence,
    };
}

export type Band = "low" | "mid" | "high";

export type DisplayCategory = keyof DisplayScores;

export const DISPLAY_CATEGORY_LABELS: Record<DisplayCategory, string> = {
    overallConfidence: "Overall Confidence",
    vcFundabilityScore: "VC Fundability Score",
    leadingCompetitorScore: "Leading Competitor Score",
    aiConfidence: "AI Confidence",
};

export function bandFor(score: number): Band {
    if (score < 40) return "low";
    if (score <= 70) return "mid";
    return "high";
}

export type BandRecommendation = {
    title: string;
    description: string;
    improvements: string[];
    links: { label: string; href: string }[];
};

const loremLinks = (): { label: string; href: string }[] => [
    { label: "tool", href: "/navigate" },
    { label: "Consectetur adipiscing elit", href: "#" },
    { label: "Sed do eiusmod tempor", href: "#" },
];

export const RECOMMENDATIONS: Record<
    DisplayCategory,
    Record<Band, BandRecommendation>
> = {
    overallConfidence: {
        low: {
            title: "Your overall conviction needs a rebuild",
            description:
                "Right now your answers suggest low conviction across journey, focus, and stage. That's normal — it usually means you haven't picked a single sharp problem to own. The fastest way to raise confidence is to shrink scope until the next step is obvious.",
            improvements: [
                "Write down the single customer pain you're solving in one sentence — if it takes two, keep editing.",
                "Pick one metric that proves that pain is real (signups, retention, revenue) and review it every Monday.",
                "Cut every initiative that doesn't move that metric in the next 4 weeks.",
            ],
            links: loremLinks(),
        },
        mid: {
            title: "Solid footing — now sharpen the focus",
            description:
                "You've got a reasonable handle on your business, but the middle band suggests diffusion: too many parallel bets, or a narrative that still hedges. Founders here usually unlock the next level by saying no to one big thing.",
            improvements: [
                "Identify the one bet you'd double if you had to drop everything else, and resource it properly.",
                "Rewrite your one-liner so a stranger can repeat it after hearing it once.",
                "Set a 6-week milestone and tell someone you trust — external commitment raises internal confidence.",
            ],
            links: loremLinks(),
        },
        high: {
            title: "Strong conviction — protect it",
            description:
                "You're operating with real clarity about where you're going. The risk at this level isn't doubt, it's overconfidence: skipping validation steps because the story feels airtight. Stay honest by stress-testing the plan against people who don't already believe it.",
            improvements: [
                "Run a pre-mortem: assume the company failed in 18 months and write down the three most likely causes.",
                "Pitch your plan to two skeptics this month and log every objection you can't immediately answer.",
                "Revisit your roadmap quarterly and delete one thing each time — focus is a muscle.",
            ],
            links: loremLinks(),
        },
    },
    vcFundabilityScore: {
        low: {
            title: "Not yet fundable — and that's fixable",
            description:
                "Your fundability signals are weak right now: the story, the metrics, or the stage probably aren't matching what VCs pattern-match against. That's not a verdict on the business — it usually just means the materials and milestones aren't VC-shaped yet.",
            improvements: [
                "Build a 12-slide deck that answers: problem, why now, solution, traction, market size, team, ask.",
                "Identify the single milestone that would make you obviously fundable (e.g. $10k MRR, 3 paying pilots) and sprint toward it.",
                "Get warm intros to 5 founders who recently raised, and ask what their deck said at your stage.",
            ],
            links: loremLinks(),
        },
        mid: {
            title: "Fundable with work — close the gaps",
            description:
                "You're in the zone where some investors will lean in and others will pass, and the difference is usually narrative tightness and evidence. The good news: at this band, small improvements in how you present the business can shift term-sheet outcomes.",
            improvements: [
                "Rehearse a 2-minute verbal pitch until it's airtight — most meetings are won or lost in the first 120 seconds.",
                "Pre-build a lightweight data room: cap table, deck, metrics snapshot, key contracts. Readiness signals seriousness.",
                "List the 3 hardest questions an investor could ask, and write out honest answers with numbers attached.",
            ],
            links: loremLinks(),
        },
        high: {
            title: "Strongly fundable — run a tight process",
            description:
                "Your signals line up with what institutional investors look for. The job now shifts from becoming fundable to running a disciplined raise: picking the right partners, creating urgency, and not letting the process drag.",
            improvements: [
                "Build a target list of 30 funds filtered by stage, check size, and thesis — don't spray and pray.",
                "Compress first meetings into a 2-3 week window to create real momentum and parallel term sheets.",
                "Decide your walk-away terms before the first meeting so you negotiate from calm, not need.",
            ],
            links: loremLinks(),
        },
    },
    leadingCompetitorScore: {
        low: {
            title: "You're losing to your leading competitor",
            description:
                "On the dimensions you're tracking, your leading competitor is ahead — and the gap is big enough that it's shaping customer choices, investor perception, or both. This is recoverable, but only if you stop competing on their terms.",
            improvements: [
                "Write down the one dimension where they're weak and you're strong — that's your wedge, not feature parity.",
                "Talk to 5 customers who chose them, and 5 who chose you. The difference in language is your positioning.",
                "Stop tracking their feature list weekly. Pick one metric where you can be #1 in a niche within 6 months.",
            ],
            links: loremLinks(),
        },
        mid: {
            title: "Competitive parity — find the wedge",
            description:
                "You're roughly level with your leading competitor. That's uncomfortable ground: customers see you as interchangeable, and ties tend to go to the incumbent. The way out is a credible, named difference that matters to a specific buyer.",
            improvements: [
                "Pick a segment (industry, size, geography) where you can be the obvious choice in 90 days — own it.",
                "Publish a comparison page that names the trade-offs honestly. VCs and buyers both respect it.",
                "Ship one thing this quarter that they structurally can't copy (business model, pricing, distribution).",
            ],
            links: loremLinks(),
        },
        high: {
            title: "You're out-positioning them — keep pressing",
            description:
                "You're ahead of your leading competitor on the things that matter. The risk now is complacency: categories get re-leveled quickly when the leader stops shipping or the follower finds a new wedge. Press the advantage while it's cheap to do so.",
            improvements: [
                "Codify your moat in one sentence and make sure every hire and roadmap item reinforces it.",
                "Set a quarterly 'red team' review where someone on the team argues the competitor's case.",
                "Invest in brand and community now — leads decay slower than features.",
            ],
            links: loremLinks(),
        },
    },
    aiConfidence: {
        low: {
            title: "AI has low confidence in the data so far",
            description:
                "Across your scores, the blended AI confidence is low. That usually means the inputs are thin or internally inconsistent — the model doesn't have enough signal to make a strong call either way. More honest data in, better guidance out.",
            improvements: [
                "Re-take the assessment with your actual numbers in mind, not aspirational ones.",
                "Add concrete traction data (revenue, retention, growth) wherever the question allows it.",
                "Revisit in 2 weeks — a trend line is far more useful than a single snapshot.",
            ],
            links: loremLinks(),
        },
        mid: {
            title: "AI has moderate confidence — keep feeding it signal",
            description:
                "The blended AI confidence is middling: there's a real signal in your answers, but it's noisy. That's typical for companies in transition. The fix isn't gaming the inputs — it's producing more concrete evidence so the next assessment is sharper.",
            improvements: [
                "Anchor each answer to a number (users, MRR, NPS) rather than a feeling.",
                "Track one North Star metric for the next 30 days so the next assessment has a trend, not a point.",
                "Compare your self-assessment with one trusted advisor's take — divergence is data.",
            ],
            links: loremLinks(),
        },
        high: {
            title: "AI has high confidence in your trajectory",
            description:
                "Across the inputs, the blended AI confidence is high — your signals are consistent and pointing the same direction. Treat this as a tailwind, not a destination: confidence compounds when it converts into shipped milestones.",
            improvements: [
                "Convert the confidence into one aggressive but honest commitment for the next 6 weeks.",
                "Use this moment to raise, hire, or launch — windows of high signal don't stay open forever.",
                "Re-run the assessment monthly to catch drift early.",
            ],
            links: loremLinks(),
        },
    },
};
