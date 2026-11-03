// Phosphor sprite shared with the app (public/app/icons.svg).
export function Icon({ name, className = "ico" }: { name: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <use href={`/app/icons.svg#${name}`} />
    </svg>
  );
}
