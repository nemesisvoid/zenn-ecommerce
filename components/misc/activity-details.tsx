const ActivityDetails = ({ details }: { details: Record<string, { old: any; new: any }> }) => {
  Object.entries(details).map(([field, value]) => console.log(field, value));
  return (
    <div className='mt-2 space-y-1 rounded bg-gray-50 px-4 p-2 text-xs dark:bg-dark-100'>
      {Object.entries(details).map(([field, value]) => (
        <div
          key={field}
          className='flex gap-2'>
          <span className='text-sm font-medium capitalize text-black dark:text-white'>{field}:</span>
          <span className='line-through text-red-500'>{String(value === null ? '' : value?.old)}</span>
          <span className='text-green-600'>→ {String(value.new)}</span>
        </div>
      ))}
    </div>
  );
};

export default ActivityDetails;
