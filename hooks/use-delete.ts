import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

export const useDelete = (fn: (id: string) => Promise<{ success: boolean; message: string } | undefined>) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await fn(id);
      console.log('response', res);
      if (res?.success) {
        toast.success(res?.message);
        router.refresh();
      } else {
        toast.error(res?.message);
      }
    });
  };

  return { isPending, handleDelete };
};
