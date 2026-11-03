import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export type Plan = { name: string; price: string; per?: string; text?: string; items: string[]; featured?: boolean };

function PlanColumn({ plan, cta, href }: { plan: Plan; cta: string; href: string }) {
  return (
    <div className={cn("sheet flex flex-col p-7", plan.featured && "plate-deep")}>
      <h3 className="text-title">{plan.name}</h3>
      <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
        <span className="num text-[2.2rem] font-bold leading-none tracking-[-.03em]">{plan.price}</span>
        {plan.per && <span className="text-sm text-ink-3">{plan.per}</span>}
      </p>
      {plan.text && <p className="mt-3 text-sm text-ink-2">{plan.text}</p>}
      <ul className="mt-6 flex flex-col gap-2.5 border-t border-rule-2 pt-6 text-sm">
        {plan.items.map((i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Icon name="i-check" className="ico mt-0.5 h-4 w-4 text-cross-ink" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
      <Link href={href} className={cn("btn mt-8", plan.featured ? "btn-primary" : "btn-secondary")}>{cta}</Link>
    </div>
  );
}

// Two audiences, two tabs, no JavaScript: radio inputs and :has() drive the panes (globals.css).
export function Pricing({
  tabs,
  people,
  retailers,
  ctas,
  pilot,
}: {
  tabs: { people: string; retailers: string };
  people: Plan[];
  retailers: Plan[];
  ctas: { people: string; retailers: string };
  pilot: string;
}) {
  return (
    <div className="tabbed">
      <div className="tabs" role="tablist">
        <input type="radio" name="pricing-tab" id="tab-people" defaultChecked />
        <label htmlFor="tab-people">{tabs.people}</label>
        <input type="radio" name="pricing-tab" id="tab-retailers" />
        <label htmlFor="tab-retailers">{tabs.retailers}</label>
      </div>
      <div className="pane pane-people mt-8">
        <div className="grid gap-6 md:grid-cols-2 lg:max-w-[52rem]">
          {people.map((p) => <PlanColumn key={p.name} plan={p} cta={ctas.people} href="/contact" />)}
        </div>
      </div>
      <div className="pane pane-retailers mt-8">
        <div className="grid gap-6 md:grid-cols-3">
          {retailers.map((p) => <PlanColumn key={p.name} plan={p} cta={ctas.retailers} href="/contact#retailers" />)}
        </div>
        <p className="mt-6 max-w-[64ch] text-sm text-ink-2">{pilot}</p>
      </div>
    </div>
  );
}
