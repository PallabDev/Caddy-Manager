import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary-soft text-primary border-primary/20",
        secondary:
          "bg-surface text-muted border-border",
        destructive:
          "bg-danger/10 text-danger border-danger/20",
        success:
          "bg-success/10 text-success border-success/20",
        warning:
          "bg-warning/10 text-warning border-warning/20",
        accent:
          "bg-accent-soft text-accent border-accent/20",
        outline:
          "text-text border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
