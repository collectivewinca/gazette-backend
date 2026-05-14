import { getFirstClass, getClassMembers } from '@/lib/queries';
import { getClassStats } from '@/lib/actions';
import Link from 'next/link';
import { AdminDashboard } from './admin-dashboard';
import { AdminGate } from './admin-gate';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  return (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  );
}
