import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"button"> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "big";
};

// Pills in the app's grammar: one primary per step, then secondary, then text links.
export function Button({ asChild, variant = "primary", size = "default", className, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn("btn", `btn-${variant}`, size === "big" && "btn-big", className)} {...props} />;
}
