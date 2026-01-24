import React from 'react';
import { getMyPurchases } from '../api/client';

type Props = {
  tierId: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

type Purchase = {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  tier?: { id: string };
  tierId?: string; // fallback if backend omits nested tier
};

const RequireEnrollment: React.FC<Props> = ({ tierId, fallback = null, children }) => {
  const [allowed, setAllowed] = React.useState<boolean>(false);
  const [checked, setChecked] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      try {
        const list = await getMyPurchases({ ttlMs: 10 * 60 * 1000 });
        const purchases: Purchase[] = Array.isArray(list) ? list : [];
        const ok = purchases.some(p => (p.status === 'CONFIRMED') && ((p.tier && p.tier.id === tierId) || (p.tierId === tierId)));
        setAllowed(ok);
      } catch {
        setAllowed(false);
      } finally {
        setChecked(true);
      }
    })();
  }, [tierId]);

  if (!checked) return null;
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
};

export default RequireEnrollment;
