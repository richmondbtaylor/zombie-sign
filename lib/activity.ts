import { newId } from "@/lib/db";
import type { Doc } from "@/lib/types";

// Add one line to a document's activity list (created, sent, signed, declined).
// ZOMBIE: this is not a real audit trail. The list sits in the same JSON as the document, so it can be edited
// (see app/api/documents/[id]/activity). No IP address, no browser info, no consent is stored, and nothing is hashed or chained.
export function addActivity(doc: Doc, type: "created" | "sent" | "signed" | "declined", who: string, note?: string) {
  if (!doc.activity) doc.activity = [];
  doc.activity.push({
    id: newId() + Math.floor(Math.random() * 1000),
    type,
    who,
    at: new Date().toISOString(),
    ...(note ? { note } : {}),
  });
}
