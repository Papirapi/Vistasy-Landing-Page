// FAQ rows (landing-page: objection handling is a section). Native details/summary: keyboard and
// screen-reader behaviour for free; the height animates where interpolate-size is supported.
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="faq">
      {items.map((it) => (
        <details key={it.q}>
          <summary>
            {it.q}
            <span className="pm" aria-hidden="true" />
          </summary>
          <p className="ans">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
