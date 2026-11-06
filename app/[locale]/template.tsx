import type { ReactNode } from "react";

// Every page renders inside its own element, remounted on each navigation. GSAP pins wrap their target
// in a spacer element; if a pinned section were a direct child of the persistent <main>, React could no
// longer remove it on navigation (removeChild NotFoundError, blank page). Inside this wrapper, a pinned
// scene leaves together with its page. display: contents keeps the layout unchanged.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="contents">{children}</div>;
}
