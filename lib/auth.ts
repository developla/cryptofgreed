import { cookies } from 'next/headers';
import { prisma } from './db';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function createAuthToken(userId: string, email: string) {
  return sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyAuth(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    return prisma.user.findUnique({ where: { id: decoded.userId } });
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(token: string) {
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export function clearAuthCookie() {
  cookies().delete('auth_token');
}
