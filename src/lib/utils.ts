/**
 * Tiny className combiner (shadcn-style `cn`) without external deps.
 * Filters falsy values and joins the rest with a space.
 * Swap for clsx + tailwind-merge when shadcn/ui is added in a later phase.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
