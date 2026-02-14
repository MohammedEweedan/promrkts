'use client';
import CrudPage from '@/components/CrudPage';
export default function TokenomicsPage() {
  return <CrudPage title="Tokenomics" endpoint="/admin/db/tokenTransaction" />;
}
