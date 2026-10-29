# MEL.md

This is a hackathon project: a half-built copy of DocuSign (an e-signature tool) that we are turning into a real SaaS product the whole group can use.

## The stack

- Next.js (App Router) + TypeScript + React. Plain CSS in `app/globals.css`, no Tailwind.
- Data: `lib/db.ts` reads and writes `data/db.json`. `data/seed.json` is the starting data. This is temporary.
- App: documents, signers, activity lines and templates live in `data/db.json`. API routes are in `app/api/documents/` and `app/api/templates/`. The signer page (sign or decline) is `app/sign/[id]/page.tsx`.
- Pages: the dashboard is `app/page.tsx`, the full list is `app/documents/page.tsx`, one document is `app/documents/[id]/page.tsx`, templates are `app/templates/page.tsx`.
- `lib/activity.ts` adds a line to a document's activity list. `lib/types.ts` holds the shapes and the `signerStatus` helper.
- Payments: `app/api/checkout/route.ts` is a stub. Stripe is not connected.

## The job

Work through `ZOMBIE.md` in order: make it work, make it secure, make it compliant, connect Stripe, ship it.
Every planted problem in the code is marked with a `ZOMBIE:` comment.

## Rules for agents

- Keep it running. Run `npm run build` after each change and fix what breaks.
- Never commit secrets. Keys go in `.env.local` (it is git-ignored).
- Use Stripe test mode keys only.
- When you fix a `ZOMBIE:` item, delete its comment and tick its box in `ZOMBIE.md`.
- Small commits with plain messages.
