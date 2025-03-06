'use client';

import dynamic from 'next/dynamic';

// Dynamically import the CountdownTimer with no SSR
const CountdownTimer = dynamic(() => import('./CountdownTimer'), { ssr: false });

export default function CountdownWrapper() {
  return <CountdownTimer />;
} 