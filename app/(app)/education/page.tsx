'use client';

import { useRouter } from 'next/navigation';
import LearningHub from '@/components/LearningHub';

export default function EducationPage() {
  const router = useRouter();

  return <LearningHub onClose={() => router.push('/day')} />;
}
