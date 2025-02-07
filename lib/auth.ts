import { headers } from 'next/headers';
import { prisma } from './db';

export async function getAuthenticatedUser() {
  const headersList = headers();
  const walletAddress = headersList.get('x-wallet-address');
  
  if (!walletAddress) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress },
  });

  return user;
}