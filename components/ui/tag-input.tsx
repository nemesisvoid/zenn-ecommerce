import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { XIcon } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput = ({ value = [], onChange, placeholder = 'Add values...' }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !value.includes(newTag)) {
      onChange([...value, newTag]);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '') {
      removeTag(value.length - 1);
    }
  };
  return (
    <div className='flex flex-wrap items-center gap-2 rounded-md border border-input p-2'>
      {value.map((tag, index) => (
        <Badge
          key={index}
          variant='secondary'
          className='flex items-center gap-1'>
          {tag}
          <button
            type='button'
            className='text-sm rounded-full outline-none hover:bg-destructive/20'
            onClick={() => removeTag(index)}>
            <XIcon className='h-3 w-3' />
          </button>
        </Badge>
      ))}

      <Input
        type='text'
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
        className='flex-1 border-none shadow-none focus-visible:ring-0'
      />
    </div>
  );
};

export default TagInput;
