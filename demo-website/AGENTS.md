## Styling
### Brand Colors

- Name Hex Typical use
Primary light blue #4FBBEA Highlights, links, checks, gradient start
Primary dark blue #3160AE Headers, primary buttons, active tabs
Primary button hover #254a8f Navy CTA hover

- Hex Typical use
#1a365d In-app titles (serif)
#1a2744 Landing headlines
#475569 Secondary body
#64748b Meta, captions
#f1f5f9 Logged-in page background
#FAFBFD Public landing background
#FFFFFF Cards, heroes

These are implemented as Tailwind v4 theme tokens in `src/app/globals.css`
(`@theme` block): `brand-light`, `brand`, `brand-hover`, `title`, `headline`,
`body`, `meta`, `bg-app`, `bg-landing` (e.g. `bg-brand`, `text-title`,
`bg-bg-app`). The site is light-theme only.

### Common UI Patterns

- Eyebrow: #4FBBEA , uppercase, wide tracking (e.g. 11px, ~0.18 to 0.22em)
- Cards: rounded-2xl , border #3160AE at ~12% opacity, white / white 90%, light shadow
- Primary CTA: rounded-full , #3160AE fill, white text
- Secondary CTA: rounded-full , border #3160AE at ~25% opacity, text #3160AE
- Accent: vertical or horizontal gradient #4FBBEA → #3160AE

### Typography
Role Font Fallback
Body / UI DM Sans system-ui, sans-serif
Display / headings DM Serif Display Georgia, serif

Fonts are loaded via `next/font/google` in `src/app/layout.tsx` and exposed as
Tailwind utilities `font-landing` (DM Sans, body) and `font-heading` (DM Serif
Display, headings). Landing uses DM Sans for body and DM Serif Display for
heroes. Logged-in workbench-style pages use DM Sans + serif titles at #1a365d.
Some standalone investor-style forms still use Montserrat (headings) and Open Sans (body).

## App Structure

- `/` — public landing page (`src/app/page.tsx`), auth-aware header.
- `/login` — combined email/password sign-in/sign-up (`src/app/login/page.tsx`),
  redirects to `/dashboard` on success.
- `/dashboard` — assessment + Q&A page (`src/app/dashboard/page.tsx`), requires
  auth (redirects to `/login` when signed out). Shows a hard-coded 4-question
  founder assessment (radio groups, one answer each: journey, hardest thing,
  stage, pitch deck import status). On submit it computes raw category scores
  plus four 0–100 "display scores" (three random, AI confidence = avg of the
  other three), persists everything to RTDB, and redirects to
  `/recommendation`. Below the form sits the running per-user Q&A list.
  Question definitions, scoring, and banded recommendation copy live in
  `src/lib/assessment.ts`.
- `/recommendation` — results page (`src/app/recommendation/page.tsx`),
  requires auth (redirects to `/login` when signed out; redirects to
  `/dashboard` when no assessment exists yet). Renders four score cards
  (Overall Confidence, VC Fundability Score, Leading Competitor Score, AI
  Confidence) out of 100 with progress bars, each with a band-specific
  (low/mid/high) description, improvement tips, and lorem-ipsum links.

## Firebase

- Config in `src/lib/firebase.ts` (lazy getters; env vars `NEXT_PUBLIC_FIREBASE_*` in `.env`).
- Auth: email/password via Firebase Auth.
- Data: Firebase **Realtime Database** (not Firestore).
- `src/lib/useAuth.ts` exports `useAuth()` (`{ user, loading }` via
  `onAuthStateChanged`) and `signOutUser()`.

### RTDB data shape

Questions & answers are stored per user (the user is the tenant):

```
users/$uid/qa/$pushId = {
  question: string,
  answer: string | null,
  createdAt: serverTimestamp,
  answeredAt: serverTimestamp | null
}
```

The dashboard assessment is a single record per user, overwritten on each
submit (answers are option ids from `src/lib/assessment.ts`). `scores` are the
raw category sums; `displayScores` are the four 0–100 numbers shown on
`/recommendation` (three random + AI confidence = rounded avg of the other
three), generated at submit time so refreshes stay stable.

```
users/$uid/assessment = {
  journey: string,
  hardest: string,
  stage: string,
  pitchDeck: string,
  scores: { overall: number, leadingCompetitor: number, fundability: number },
  displayScores: {
    overallConfidence: number,
    vcFundabilityScore: number,
    leadingCompetitorScore: number,
    aiConfidence: number
  },
  updatedAt: serverTimestamp
}
```

Security rules restrict `users/$uid` read/write to the owner:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```
