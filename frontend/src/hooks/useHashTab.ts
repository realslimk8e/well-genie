import { useEffect, useState } from 'react';
import { type NavKey, tabFromHash } from '../features/navigation/nav';

const initialTabFromHash = (): NavKey => {
  if (typeof window === 'undefined') return 'overview';
  return tabFromHash(window.location.hash);
};

export function useHashTab() {
  const [tab, setTab] = useState<NavKey>(initialTabFromHash);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const desired = `#${tab}`;
    if (window.location.hash !== desired) {
      window.history.replaceState(null, '', desired);
    }
  }, [tab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      setTab(tabFromHash(window.location.hash));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return { tab, setTab };
}
