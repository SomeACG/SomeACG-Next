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

  return {
    images: images.map(image => ({
      ...image,
      userid: image.userid ? image.userid.toString() : null,
      authorid: image.authorid ? image.authorid.toString() : null,
    })),
    total
  };
}
