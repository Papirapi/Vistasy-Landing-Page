"use client";
// Billing cycle pricing, from craftwork.design/components/sevenui/billing-cycle-pricing (toggle-group-07)
// Source: sevenui by Oğuzhan Yılmaz (github.com/useui/sevenui: registry/base/ui/toggle.tsx,
// toggle-group.tsx and the toggle-group-07 example), MIT licence. Same anatomy: Base UI's Toggle and
// ToggleGroup with sevenui's variants (outline, joined when spacing is 0, the outer corners rounded, the
// pressed item filled), a two-item "Billing cycle" group whose yearly item carries a badge, and the price
// beneath it in a polite live region. Ported changes: VISTASY tokens (pill corners, the violet accent marks
// the pressed item, the hairline rule as the outline, our 40px control height and 15px type, hover only for
// a fine pointer, the site's focus ring instead of the shadcn ring), the badge is our .v-tag, the card and
// button map to the page's .s1 card and .btn (in components/pricing/pricing.tsx), and the cycle values come
// from the page's copy rather than the demo's.
import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ── toggle.tsx ───────────────────────────────────────────────────────────────
const toggleVariants = cva(
  "group/toggle inline-flex cursor-pointer items-center justify-center gap-1 rounded-full text-[0.9375rem] font-medium whitespace-nowrap text-ink-2 transition-[background-color,color,box-shadow] duration-[var(--t-quick)] ease-[var(--ease-out)] hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:text-ink disabled:pointer-events-none disabled:opacity-50 data-[pressed]:bg-cross-soft data-[pressed]:text-cross-ink data-[pressed]:hover:bg-cross-soft [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-rule bg-transparent",
      },
      size: {
        default: "h-10 min-w-10 px-4",
        sm: "h-8 min-w-8 px-3 text-[0.8125rem]",
        lg: "h-12 min-w-12 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Toggle({ className, variant = "default", size = "default", ...props }: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive data-slot="toggle" className={cn(toggleVariants({ variant, size, className }))} {...props} />;
}

// ── toggle-group.tsx ─────────────────────────────────────────────────────────
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-full data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing, orientation }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem({ className, children, variant = "default", size = "default", ...props }: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:rounded-none group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:first:rounded-l-full group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:first:rounded-t-full group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:last:rounded-r-full group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:last:rounded-b-full group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { Toggle, toggleVariants, ToggleGroup, ToggleGroupItem };

// ── toggle-group-07: the billing cycle switch ────────────────────────────────
export type Cycle = "monthly" | "yearly";
export type BillingCycleStrings = { label: string; monthly: string; yearly: string; save: string };

/** The "Billing cycle" group from toggle-group-07: Monthly, and Yearly with its saving as a badge. In a narrow
 *  card (a phone at 320px, three plans in a row on a small laptop) the items tighten, then the badge steps
 *  aside: the hint under the monthly price states the same saving. */
export function BillingCycle({ value, onChange, s, className }: { value: Cycle; onChange: (c: Cycle) => void; s: BillingCycleStrings; className?: string }) {
  return (
    <div className={cn("@container w-full", className)}>
      <ToggleGroup
        aria-label={s.label}
        variant="outline"
        spacing={0}
        value={[value]}
        onValueChange={(next) => {
          if (next[0]) onChange(next[0] as Cycle);
        }}
        className="w-full"
      >
        <ToggleGroupItem value="monthly" className="min-w-fit flex-1 @max-[20rem]:px-2.5">
          {s.monthly}
        </ToggleGroupItem>
        <ToggleGroupItem value="yearly" className="min-w-fit flex-1 gap-1.5 @max-[20rem]:px-2.5">
          {s.yearly}
          <span className="bc-badge v-tag px-1.5 py-0 text-[0.75rem] leading-[1.35rem]">{s.save}</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
