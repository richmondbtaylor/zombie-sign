// Shapes of the records we keep in data/db.json.
export type Signer = {
  id: string;
  name: string;
  email: string;
  signature: string; // the typed name, empty until signed
  signedAt: string; // ISO time, empty until signed
  declinedAt?: string; // ISO time, empty unless the signer said no
  declineReason?: string;
};

// One line in the activity list on a document.
export type Activity = {
  id: string;
  type: "created" | "sent" | "signed" | "declined";
  who: string; // a name, or "You" for the document owner
  at: string; // ISO time
  note?: string; // for example the reason someone declined
};

export type Doc = {
  id: string;
  title: string;
  body: string;
  status: "Draft" | "Sent" | "Signed";
  createdAt: string;
  signers: Signer[];
  activity?: Activity[];
  pdfName?: string;
  pdfData?: string; // base64 of an uploaded PDF
};

export type Template = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

// A signer is waiting until they sign or decline.
export function signerStatus(s: Signer): "signed" | "declined" | "waiting" {
  if (s.signedAt) return "signed";
  if (s.declinedAt) return "declined";
  return "waiting";
}
