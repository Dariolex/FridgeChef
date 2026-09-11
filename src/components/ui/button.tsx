import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg hover:brightness-110",
        ghost: "bg-fg/8 text-fg hover:bg-fg/14",
        outline: "border border-border bg-transparent text-fg hover:bg-fg/8",
        lime: "bg-accent text-accent-fg hover:brightness-110 shadow-[0_8px_24px_rgba(198,245,61,0.28)]",
        yellow:
          "bg-amber-400 text-stone-900 hover:brightness-105 shadow-[0_8px_24px_rgba(251,191,36,0.35)]",
        sky: "bg-sky-400 text-sky-950 hover:brightness-105 shadow-[0_8px_24px_rgba(56,189,248,0.35)]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-14 px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
