'use client';

import { useRouter } from 'next/navigation';

import GeopoliticsGraph from '@/components/GeopoliticsGraph';

export default function GeopoliticsGraphPage() {
  const router = useRouter();
  return (
    <GeopoliticsGraph
      onSwitchToSelf={() => router.push('/education')}
      onOpenPage={(slug) => router.push(`/education/world?page=${slug}`)}
    />
  );
}
