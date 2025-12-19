import React from 'react';

interface UserStatCardProp {
  title: string;
  text: string | number;
  icon: React.ReactNode;
}

const UserStatCard = ({ title, text, icon }: UserStatCardProp) => {
  return (
    <div className='bg-white/60 flex items-center justify-between gap-5 p-5 py-6 rounded-md shadow-md dark:bg-dark-100'>
      <div>
        <p className='text-base font-medium mb-2 dark:text-white/90'>{title}</p>

        <p className='text-2xl text-gray-600 dark:text-white/70'>{text}</p>
      </div>

      <div className='bg-orange-200 text-orange-800 p-2 rounded-full'>{icon}</div>
    </div>
  );
};

export default UserStatCard;
