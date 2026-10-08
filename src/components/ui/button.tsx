import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-sky-500 text-slate-950 font-semibold shadow hover:bg-sky-400 shadow-sky-500/20 hover:shadow-sky-500/40",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-500 shadow-rose-600/20",
        outline:
          "border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80",
        secondary:
          "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white shadow-sm",
        ghost:
          "text-slate-300 hover:bg-slate-800/80 hover:text-white",
        link:
          "text-sky-400 underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-400 text-slate-950 font-semibold shadow-lg shadow-sky-500/25 hover:opacity-95",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
