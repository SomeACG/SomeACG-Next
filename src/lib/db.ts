import { PrismaClient } from '@prisma/client';
import path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

// TODO: 以后要从 SQLITE 迁移到 POSTGRES，现在先只读。
// 在生产环境中找到数据库文件的路径
const filePath = path.join(process.cwd(), 'prisma/dev.db');
const config = {
  datasources: {
    db: {
      url: `file:${filePath}`,
    },
  },
};

let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(config);
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient(config);
  }
  prisma = global.cachedPrisma;
}

export default prisma;
