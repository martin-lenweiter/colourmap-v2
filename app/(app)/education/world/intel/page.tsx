'use client';

import { useRouter } from 'next/navigation';

import ShippingIntelDashboard from '@/components/ShippingIntelDashboard';

export default function ShippingIntelPage() {
  const router = useRouter();
  return (
    <ShippingIntelDashboard
      onSwitchToSelf={() => router.push('/education')}
      onOpenPage={(slug) => router.push(`/education/world?page=${slug}`)}
    />
  );
}
