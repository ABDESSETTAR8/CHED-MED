/**
 * Minimal, accessible button primitive.
 * Placeholder until shadcn/ui is wired in a later phase; same prop shape so
 * swapping is painless.
 */
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
