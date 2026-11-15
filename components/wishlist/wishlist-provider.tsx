'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { toggleWishlist } from '@/actions/wishlist.actions';
import { loginUrlFor } from '@/routes';

type WishlistContextValue = {
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<boolean | null>;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

/**
 * Keeps the signed-in user's saved product ids on the client, so every heart on the page
 * reflects the same state and updates instantly (the server call follows; on failure it rolls back).
 */
export const WishlistProvider = ({ initialIds, isLoggedIn, children }: { initialIds: string[]; isLoggedIn: boolean; children: React.ReactNode }) => {
  const router = useRouter();
  const [ids, setIds] = useState(() => new Set(initialIds));
  const inFlight = useRef(new Set<string>());

  const setSaved = (productId: string, saved: boolean) =>
    setIds(prev => {
      const next = new Set(prev);
      if (saved) next.add(productId);
      else next.delete(productId);
      return next;
    });

  const toggle = useCallback(
    async (productId: string) => {
      if (!isLoggedIn) {
        toast('Sign in to save items to your wishlist');
        router.push(loginUrlFor(`${window.location.pathname}${window.location.search}`));
        return null;
      }
      if (inFlight.current.has(productId)) return null;
      inFlight.current.add(productId);

      const wasSaved = ids.has(productId);
      setSaved(productId, !wasSaved);
      try {
        const res = await toggleWishlist(productId);
        if (!res.success) {
          setSaved(productId, wasSaved);
          toast.error(res.message);
          return null;
        }
        setSaved(productId, res.wishlisted);
        toast.success(res.message, res.wishlisted ? { action: { label: 'View', onClick: () => router.push('/user/settings/wishlist') } } : undefined);
        return res.wishlisted;
      } catch {
        setSaved(productId, wasSaved);
        toast.error('Could not update your wishlist');
        return null;
      } finally {
        inFlight.current.delete(productId);
      }
    },
    [ids, isLoggedIn, router],
  );

  const value = useMemo(() => ({ has: (productId: string) => ids.has(productId), toggle, count: ids.size }), [ids, toggle]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return context;
};
