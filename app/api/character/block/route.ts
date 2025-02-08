import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
