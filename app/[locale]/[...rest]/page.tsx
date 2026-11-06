import { notFound } from "next/navigation";

// Any unknown path inside a locale renders the localised not-found page in the site shell.
export default function CatchAll() {
  notFound();
}
