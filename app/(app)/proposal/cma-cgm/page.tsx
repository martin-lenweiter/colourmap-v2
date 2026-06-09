'use client';

import { useRouter } from 'next/navigation';

import CmaCgmProposal from '@/components/CmaCgmProposal';

export default function CmaCgmProposalPage() {
  const router = useRouter();
  return (
    <CmaCgmProposal
      onOpenIntel={() => router.push('/education/world/intel')}
      onOpenWorld={() => router.push('/education/world')}
    />
  );
}
