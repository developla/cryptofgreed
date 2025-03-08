'use client';
import dynamic from 'next/dynamic'

const Game = dynamic(() => import('@/components/views/Game'), {
  ssr: false
})

export default function Page() {
  return <Game />;
}
