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

/**
 * 获取特定画师的作品
 * @param platform 平台
 * @param authorid 画师ID
 * @param page 页数
 * @param pageSize 每页数量
 * @returns 画师作品数据
 */
export async function getArtistImages(platform: string, authorid: string, page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [images, total] = await Promise.all([
    prisma.image.findMany({
      where: {
        platform,
        authorid: BigInt(authorid),
      },
      skip,
      take,
      orderBy: {
        create_time: 'desc',
      },
    }),
    prisma.image.count({
      where: {
        platform,
        authorid: BigInt(authorid),
      },
    }),
  ]);

  const allTags = await prisma.imageTag.findMany({
    where: {
      pid: {
        in: images.map((img) => img.pid?.toString() ?? ''),
      },
    },
  });

  const imagesWithTags = images.map((img) => {
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
 * 获取画师信息
 * @param platform 平台
 * @param authorid 画师ID
 * @returns 画师信息
 */
export async function getArtistInfo(platform: string, authorid: string) {
  const artist = await prisma.image.findFirst({
    where: {
      platform,
      authorid: BigInt(authorid),
    },
    select: {
      author: true,
      authorid: true,
      platform: true,
    },
  });

  if (!artist) {
    return null;
  }

  // 获取作品数量
  const artworkCount = await prisma.image.count({
    where: {
      platform,
      authorid: BigInt(authorid),
    },
  });

  return {
    ...artist,
    authorid: artist.authorid?.toString(),
    artworkCount,
  };
}
