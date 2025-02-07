import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { WalletType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { address, type } = await request.json();
    console.log("Wallet connection request:", { address, type });

    const user = await prisma.user.upsert({
      where: { walletAddress: address },
      update: {},
      create: {
        walletAddress: address,
        walletType: type as WalletType,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to authenticate wallet:", error);
    return NextResponse.json(
      { error: "Failed to authenticate wallet" },
      { status: 500 }
    );
  }
}
