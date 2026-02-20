import { Input } from '../ui/input';

const SearchBar = () => {
  return (
    <form
      className='w-[65%] lg:w-1/2'
      action='/search'
      method='GET'>
      <Input
        name='query'
        className=' h-12 rounded-full bg-accent-200 text-black px-5 placeholder:text-black focus:outline-none focus:ring-2 focus:ring-accent-200 dark:text-white dark:placeholder:text-gray-200'
        placeholder='search products...'
      />
    </form>
  );
};

export default SearchBar;
