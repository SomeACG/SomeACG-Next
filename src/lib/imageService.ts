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

/**
 * 获取热门画师列表
 * @param page 页数
 * @param pageSize 每页数量
 * @param sortBy 排序方式: 'artworks' | 'random' | 'lastUpdate'
 * @returns 热门画师数据
 */
export async function getPopularArtists(
  page: number,
  pageSize: number,
  sortBy: 'artworks' | 'random' | 'lastUpdate' = 'artworks',
) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  try {
    if (sortBy === 'random') {
      // 随机排序：先获取所有唯一的画师，然后随机选择
      const allArtists = await prisma.image.groupBy({
        by: ['platform', 'authorid'],
        _count: {
          id: true,
        },
        where: {
          platform: {
            not: null,
          },
          authorid: {
            not: null,
          },
          author: {
            not: null,
          },
        },
        having: {
          authorid: {
            not: null,
          },
        },
      });

      // 随机打乱数组
      const shuffledArtists = allArtists.sort(() => Math.random() - 0.5);

      // 取指定页面的数据
      const pageArtists = shuffledArtists.slice(skip, skip + take);

      // 获取每个画师的最新作品作为头像和author信息
      const artistsWithLatestImage = await Promise.all(
        pageArtists.map(async (artist) => {
          const latestImage = await prisma.image.findFirst({
            where: {
              platform: artist.platform,
              authorid: artist.authorid,
            },
            orderBy: {
              create_time: 'desc',
            },
            select: {
              thumburl: true,
              create_time: true,
              filename: true,
              author: true,
              width: true,
              height: true,
            },
          });

          return {
            platform: artist.platform,
            authorid: artist.authorid?.toString(),
            author: latestImage?.author || null,
            artworkCount: artist._count.id,
            latestImageThumb: latestImage?.thumburl || null,
            latestImageFilename: latestImage?.filename || null,
            lastUpdateTime: latestImage?.create_time || null,
            latestImageWidth: latestImage?.width || null,
            latestImageHeight: latestImage?.height || null,
          };
        }),
      );

      return {
        artists: artistsWithLatestImage,
        total: allArtists.length,
        hasNextPage: skip + take < allArtists.length,
      };
    } else if (sortBy === 'lastUpdate') {
      // 按最近更新时间排序：先获取所有画师的最新作品时间，然后排序
      const artistsWithLatestTime = await prisma.image.groupBy({
        by: ['platform', 'authorid'],
        _count: {
          id: true,
        },
        _max: {
          create_time: true,
        },
        where: {
          platform: {
            not: null,
          },
          authorid: {
            not: null,
          },
          author: {
            not: null,
          },
        },
        orderBy: {
          _max: {
            create_time: 'desc',
          },
        },
        having: {
          authorid: {
            not: null,
          },
        },
      });

      const total = artistsWithLatestTime.length;
      const pageArtists = artistsWithLatestTime.slice(skip, skip + take);

      // 获取每个画师的详细信息
      const artistsWithLatestImage = await Promise.all(
        pageArtists.map(async (artist) => {
          const latestImage = await prisma.image.findFirst({
            where: {
              platform: artist.platform,
              authorid: artist.authorid,
            },
            orderBy: {
              create_time: 'desc',
            },
            select: {
              thumburl: true,
              create_time: true,
              filename: true,
              author: true,
              width: true,
              height: true,
            },
          });

          return {
            platform: artist.platform,
            authorid: artist.authorid?.toString(),
            author: latestImage?.author || null,
            artworkCount: artist._count.id,
            latestImageThumb: latestImage?.thumburl || null,
            latestImageFilename: latestImage?.filename || null,
            lastUpdateTime: latestImage?.create_time || null,
            latestImageWidth: latestImage?.width || null,
            latestImageHeight: latestImage?.height || null,
          };
        }),
      );

      return {
        artists: artistsWithLatestImage,
        total,
        hasNextPage: skip + take < total,
      };
    } else {
      // 按作品数量排序
      const artists = await prisma.image.groupBy({
        by: ['platform', 'authorid'],
        _count: {
          id: true,
        },
        where: {
          platform: {
            not: null,
          },
          authorid: {
            not: null,
          },
          author: {
            not: null,
          },
        },
        orderBy: [
          {
            _count: {
              id: 'desc',
            },
          },
          {
            platform: 'asc',
          },
          {
            authorid: 'asc',
          },
        ],
        skip,
        take,
        having: {
          authorid: {
            not: null,
          },
        },
      });

      // 获取总数 (使用相同的排序确保一致性)
      const totalArtistsResult = await prisma.image.groupBy({
        by: ['platform', 'authorid'],
        where: {
          platform: {
            not: null,
          },
          authorid: {
            not: null,
          },
          author: {
            not: null,
          },
        },
        orderBy: [
          {
            _count: {
              id: 'desc',
            },
          },
          {
            platform: 'asc',
          },
          {
            authorid: 'asc',
          },
        ],
        having: {
          authorid: {
            not: null,
          },
        },
      });

      const total = totalArtistsResult.length;

      // 获取每个画师的最新作品作为头像和author信息
      const artistsWithLatestImage = await Promise.all(
        artists.map(async (artist) => {
          const latestImage = await prisma.image.findFirst({
            where: {
              platform: artist.platform,
              authorid: artist.authorid,
            },
            orderBy: {
              create_time: 'desc',
            },
            select: {
              thumburl: true,
              create_time: true,
              filename: true,
              author: true,
              width: true,
              height: true,
            },
          });

          return {
            platform: artist.platform,
            authorid: artist.authorid?.toString(),
            author: latestImage?.author || null,
            artworkCount: artist._count.id,
            latestImageThumb: latestImage?.thumburl || null,
            latestImageFilename: latestImage?.filename || null,
            lastUpdateTime: latestImage?.create_time || null,
            latestImageWidth: latestImage?.width || null,
            latestImageHeight: latestImage?.height || null,
          };
        }),
      );

      return {
        artists: artistsWithLatestImage,
        total,
        hasNextPage: skip + take < total,
      };
    }
  } catch (error) {
    console.error('获取热门画师失败:', error);
    throw error;
  }
}
