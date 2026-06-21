/**
 * Minimal labelled input primitive.
 * `forwardRef` so it plays nicely with form libraries added later.
 */
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "rounded-lg border border-slate-300 px-3 py-2 text-sm",
            "focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
