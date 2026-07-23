import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';

const prismaClientSingleton = () => {
  if (!env.DB_URL) {
    throw new Error('DB_URL is not configured');
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DB_URL }),
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
