import { PrismaClient } from '@prisma/client';

// 使用全局变量来防止热重载时创建多个 Prisma 实例
// 这在开发环境中特别有用

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
