import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in first' },
        { status: 401 }
      );
    }

    const { address, type } = await request.json();
    if (!address || !type) {
      return NextResponse.json(
        { error: 'Address and type are required' },
        { status: 400 }
      );
    }

    // Check if wallet is already connected to another account
    const existingWallet = await prisma.user.findFirst({
      where: {
        walletAddress: address,
        id: { not: user.id }, // Exclude current user
      },
    });

    if (existingWallet) {
      return NextResponse.json(
        { error: 'Wallet already connected to another account' },
        { status: 400 }
      );
    }

    // Update user's wallet information
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        walletAddress: address,
        walletType: type,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        walletAddress: updatedUser.walletAddress,
        walletType: updatedUser.walletType,
      },
    });
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return NextResponse.json(
      { error: 'Failed to connect wallet' },
      { status: 500 }
    );
  }
}
