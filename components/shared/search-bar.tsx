import { Input } from '../ui/input';

const SearchBar = () => {
  return (
    <Input
      className='w-1/2 h-12 rounded-full bg-accent-200 text-black placeholder:text-black focus:outline-none focus:ring-2 focus:ring-accent-200'
      placeholder='search products...'
    />
  );
};

export default SearchBar;
