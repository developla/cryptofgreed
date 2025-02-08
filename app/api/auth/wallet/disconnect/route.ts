import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in first' },
        { status: 401 }
      );
    }

    // Remove wallet connection
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        walletAddress: null,
        walletType: null,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error('Failed to disconnect wallet:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect wallet' },
      { status: 500 }
    );
  }
}
