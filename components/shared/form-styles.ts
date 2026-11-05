// Class presets for shadcn primitives on storefront forms. Passed via `className`
// so tailwind-merge can override the primitives' defaults (h-9, rounded-md, …).
export const storeInput =
  'h-11 rounded-xl border-input bg-card px-3.5 text-[0.9375rem] shadow-none transition-[border-color,box-shadow] placeholder:text-muted-foreground md:text-[0.9375rem] dark:bg-field focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 disabled:bg-muted disabled:opacity-70';

export const storeLabel = 'text-sm font-medium text-foreground';

export const storePrimaryButton = 'h-11 cursor-pointer rounded-full px-6 text-[0.9375rem] font-semibold';
