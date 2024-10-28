// 通过prisma 建立连接
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
