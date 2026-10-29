# 🧟 ZOMBIE.md: what's broken

This app is a zombie on purpose. Pick items off this list. Every box you tick gets it closer to a product we can all use and stop paying for DocuSign.

Search the code for `ZOMBIE:` to find every planted problem.

## 1. Make it work

- [ ] No email is sent. The Send button only shows a link to copy. Send each signer an email with their own link (Resend, Postmark...).
- [ ] With more than one signer, the signing order is ignored and the document is marked Signed after the first person signs. It should wait for everyone, in order.
- [ ] Declining does nothing beyond saving the reason. The sender is not told, and the document is not stopped or marked Declined.
- [ ] Templates only keep a title and text. They do not keep signer roles, fields or a PDF.
- [ ] "Download signed copy" says "Not built yet". Make a PDF with the text, each signature, the times and the audit trail.

## 2. Make it secure

- [ ] There is no login. Anyone who finds the URL sees everything. Add accounts (Supabase Auth, Clerk, Auth.js...).
- [ ] Every API route trusts whatever it's sent. Validate input on the server.
- [ ] Ids are guessable (`lib/db.ts`). Use random ids and check that the record belongs to the signed-in user.
- [ ] Data lives in `data/db.json` on disk. Move it to a real database.
- [ ] Anyone with the link can sign as anyone. Give each signer a private link or a code sent to their email.
- [ ] Anyone can edit the activity list through the API (`app/api/documents/[id]/activity`). Add, change and delete all work with no login. Make it append-only.
- [ ] Anyone can decline as any signer, and anyone can delete a template. No confirm, no undo.
- [ ] Signed documents can still be edited. Lock a document once it is signed and save a fingerprint (hash) of the text.

## 3. Make it compliant

- [ ] The new activity list is not a real audit trail. It is not tamper-proof, and it stores no IP address, no browser info and no consent. Chain or hash each line.
- [ ] No audit trail. The US E-SIGN Act and UETA expect a record of who signed, when, and from where. Save the time, IP address and every step (sent, viewed, signed).
- [ ] No consent. Signers must agree to sign electronically before they sign. The checkbox on the signing page is not required and is not saved.
- [ ] Signers in the EU or UK are covered by eIDAS and GDPR. Keep only what you need and let people ask for their data to be deleted.
- [ ] No privacy policy or terms page.
- [ ] No way for a user to export or delete their data.

## 4. Connect Stripe

- [ ] `app/api/checkout/route.ts` returns a 501. Create a Stripe Checkout Session (test mode is fine).
- [ ] Add a webhook route that marks the account as paid.
- [ ] Lock the paid features behind the plan.

## 5. Ship it

- [ ] Deploy it (Vercel, Netlify, Railway...). The JSON file database will not survive this, so do section 2 first.
- [ ] Put the live link in your README.

## What "done" looks like

Someone who has never seen it can sign up, pay, use the main feature end to end, and come back tomorrow to find their data still there.
