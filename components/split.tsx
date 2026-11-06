import { Fragment, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
  intro?: boolean;
  /** brighten word by word with scroll progress instead of rising once (scroll-scrubbed-word-reveal) */
  scrub?: boolean;
};

// A heading split into masked words on the server (masked-reveal + build-awwwards): the full sentence
// stays in the accessibility tree once (sr-only); the decorative word spans are hidden from it.
// Without JavaScript the words simply sit in place.
export function Split({ text, as: Tag = "h2", className, id, intro, scrub }: Props) {
  const words = text.split(" ");
  return (
    <Tag id={id} className={cn("split", className)} data-split="" data-hero-words={intro ? "" : undefined} data-scrub-words={scrub ? "" : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="wm">
              <span className="w" style={intro ? ({ "--i": i } as CSSProperties) : undefined}>
                {w}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
