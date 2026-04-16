import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminKpiReportsAliasPage() {
  const router = useRouter();

  useEffect(() => {
    void router.replace('/admin/reports-kpi');
  }, [router]);

  return null;
}
