import Link from 'next/link';

type SectionHeadingProps = {
  id?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
};

const SectionHeading = ({ id, title, description, href, linkLabel = 'View all' }: SectionHeadingProps) => {
  return (
    <div className='mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between'>
      <div className='max-w-xl'>
        <h2
          id={id}
          className='section-title'>
          {title}
        </h2>
        {description && <p className='lede mt-3'>{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className='text-link shrink-0 text-[0.9375rem] underline decoration-border decoration-1 underline-offset-[6px] hover:decoration-foreground'>
          {linkLabel}
        </Link>
      )}
    </div>
  );
};

export default SectionHeading;
