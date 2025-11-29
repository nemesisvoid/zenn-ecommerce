import { useTransition } from 'react';
import { toast } from 'sonner';

export const useDelete = (fn: (id: string) => Promise<{ success: boolean } | undefined>) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await fn(id);
      if (!res?.success) toast.error('Something went wrong. Please try again.');
      toast.success(res?.success);
    });
  };

  return { isPending, handleDelete };
};
