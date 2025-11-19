import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

const getPrisma = () => {
  if (typeof window === 'undefined') {
    // Server-side only
    if (!global.prisma) {
      global.prisma = createPrismaClient();
    }
    return global.prisma;
  }
  throw new Error('Prisma Client can only be used on the server');
};

export const prisma = getPrisma();
export default prisma;

