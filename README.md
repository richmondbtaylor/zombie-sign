# ZombieSign

> A half-built copy of **DocuSign**. It runs, it kind of works, and it is not ready for real users.
> Your job tonight: bring it back to life.

**Replaces:** DocuSign (paid plans) <!-- Price source: https://ecom.docusign.com/en-us/plans-and-pricing/esignature checked 2026-10-29. The page shows $10/month billed annually for Personal, but no monthly-billing price, so no number is given here. -->

**Live demo:** https://zombie-sign.vercel.app (a shared demo: data resets whenever the server restarts)

## Run it (2 minutes)

You need [Node.js 20 or newer](https://nodejs.org).

```bash
npm install
npm run dev
```

Open http://localhost:3101.

## What works

- Create a document: a title and pasted text, or attach a PDF.
- Add signers (name and email).
- Click Send to get a share link like `/sign/<id>`. Status moves from Draft to Sent.
- A signer opens the link, types their name (shown in a cursive font) and signs.
- A signer can also decline to sign and give a reason.
- The dashboard shows counts for Draft, Sent, Signed and Waiting on others, plus the 5 newest documents. Empty states tell you what to do first.
- The Documents page lists everything and can filter by status.
- Each document page shows every signer as waiting, signed or declined, and an activity list (created, sent, signed, declined).
- Templates: save any document as a template, then start a new document from it (Templates page or the "Start from a template" menu).
- 6 fake sample documents and 3 fake templates come pre-loaded.

## What's broken

See [ZOMBIE.md](ZOMBIE.md). That's the to-do list for the night.

## How we build tonight

- **Mel** ([openmel.dev](https://openmel.dev)) does the building. Open this folder in Mel and give it tasks from ZOMBIE.md.
- **Prompt Anything** ([promptanything.io](https://www.promptanything.io)) writes the prompts. Use it inside Mel for features, agents, customer success flows, code fixes and reading this repo.
- **MEL.md** in this folder tells Mel's agents what this project is and how to work on it.

## Submit

Fork this repo, push your work, and send your link through the submission form before the deadline.
Many people can pick the same app. The one that actually works wins.

## License

MIT. Use it, ship it, share it.
