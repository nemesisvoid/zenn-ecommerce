// Class presets for shadcn primitives on the auth screens. These are passed through
// `className` (not CSS classes in globals.css) so tailwind-merge can override the
// primitives' built-in utilities such as `h-9` and `dark:bg-input/30`.
export const authInput =
  'h-11 rounded-lg border-input bg-field px-3.5 text-[0.9375rem] md:text-[0.9375rem] shadow-none transition-[color,background-color,border-color,box-shadow] placeholder:text-subtle-foreground hover:bg-field-hover dark:bg-field dark:hover:bg-field-hover focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-ring/20';

export const authPrimaryButton =
  'h-11 w-full cursor-pointer rounded-lg text-[0.9375rem] font-semibold shadow-none hover:bg-primary/90 focus-visible:ring-offset-2 focus-visible:ring-offset-card';

export const authSecondaryButton =
  'h-11 w-full cursor-pointer rounded-lg border-input bg-field text-[0.9375rem] font-medium text-foreground shadow-none hover:bg-field-hover hover:text-foreground dark:border-input dark:bg-field dark:hover:bg-field-hover';
