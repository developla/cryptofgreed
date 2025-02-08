import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication' },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { blockedFromBattles: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to block user from battles:', error);
    return NextResponse.json(
      { error: 'Failed to block user from battles' },
      { status: 500 }
    );
  }
}
