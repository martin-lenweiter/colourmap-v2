'use client';

import { useRouter } from 'next/navigation';

import GeopoliticsMap from '@/components/GeopoliticsMap';

export default function GeopoliticsMapPage() {
  const router = useRouter();
  return (
    <GeopoliticsMap
      onSwitchToSelf={() => router.push('/education')}
      onOpenPage={(slug) => router.push(`/education/world?page=${slug}`)}
    />
  );
}
