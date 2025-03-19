import superjson from 'superjson';
import prisma from './db';

export async function getPaginatedImages(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [images, total] = await Promise.all([
    prisma.image.findMany({
      skip,
      take,
      orderBy: {
        create_time: 'desc',
      },
    }),
    prisma.image.count(),
  ]);

  const allTags = await prisma.imageTag.findMany({
    where: {
      pid: {
        in: images.map((img) => img.pid?.toString() ?? ''),
      },
    },
  });

  const imagesWithTags = images.map((img, index) => {
    const imgTags = allTags.filter((tag) => tag && tag.pid === img.pid?.toString());
    return {
      ...img,
      tags: imgTags.map(({ tag }) => tag?.replace(/#/g, '')),
    };
  });

  const serializedData = superjson.serialize({
    images: imagesWithTags,
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
        const tags = await prisma.imageTag.findMany({
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
