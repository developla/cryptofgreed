import prisma from "@/lib/prisma";

export async function verifyUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user || null;
}

export async function verifyAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user && user.role === "ADMIN") {
    return user;
  }

  return null;
}
