// Five steps in sequence: the numerals carry the order, so they stay. A hairline draws under them on scroll.
export function Steps({ title, items }: { title: string; items: { title: string; text: string }[] }) {
  return (
    <div>
      <h2 className="text-headline max-w-[22ch]">{title}</h2>
      <div className="hairline mt-8" aria-hidden="true" />
      <ol className="mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-5">
        {items.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-2">
            <span className="num text-sm font-bold text-cross-ink">{i + 1}</span>
            <h3 className="text-title">{s.title}</h3>
            <p className="text-sm leading-relaxed text-ink-2">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
