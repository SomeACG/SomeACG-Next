import superjson from 'superjson';
import prisma from './db';

export async function getPaginatedImages(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [images, total] = await Promise.all([
    prisma.images.findMany({
      skip,
      take,
      orderBy: {
        create_time: 'desc',
      },
    }),
    prisma.images.count(),
  ]);

  const serializedData = superjson.serialize({
    images,
    total,
  });

  return serializedData.json;
}

/**
 * 获取图片标签
 * @param pids 图片pid数组
 * @returns 图片标签数组[pid: string, tags: string[]][]
 */
export async function getTagByPids(pids: string[]) {
  try {
    if (!pids?.length) return [];
    const tags = await Promise.all(
      pids.map(async (pid) => {
        const tags = await prisma.imagetags.findMany({
          where: {
            pid,
          },
        });
        return tags;
      }),
    );
    return tags;
  } catch (error) {
    console.error('获取标签失败', error);
    return [];
  }
}
