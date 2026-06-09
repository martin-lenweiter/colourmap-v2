'use client';

import { useRouter } from 'next/navigation';

import EducationModeSwitch from '@/components/EducationModeSwitch';
import LearningHub from '@/components/LearningHub';

export default function EducationPage() {
  const router = useRouter();

  return (
    <>
      <EducationModeSwitch active="self" onSwitchToWorld={() => router.push('/education/world')} />
      <LearningHub onClose={() => router.push('/day')} />
    </>
  );
}
