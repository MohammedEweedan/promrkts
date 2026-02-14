'use client';
import CrudPage from '@/components/CrudPage';
export default function JobsPage() {
  return <CrudPage title="Jobs & Applications" endpoint="/admin/db/jobListing" />;
}
