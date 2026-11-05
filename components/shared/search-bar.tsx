import { SearchIcon } from 'lucide-react';
import { Input } from '../ui/input';

const SearchBar = () => {
  return (
    <form
      role='search'
      className='relative min-w-0 flex-1 md:max-w-md lg:max-w-lg'
      action='/search'
      method='GET'>
      <SearchIcon
        className='pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
        aria-hidden='true'
      />
      <Input
        name='query'
        type='search'
        aria-label='Search products'
        className='h-10 rounded-full border-transparent bg-secondary pl-10 pr-4 text-[0.9375rem] shadow-none transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground hover:border-border focus-visible:border-ring focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-ring/15 md:text-[0.9375rem] dark:bg-secondary dark:text-foreground!'
        placeholder='Search products'
      />
    </form>
  );
};

export default SearchBar;
