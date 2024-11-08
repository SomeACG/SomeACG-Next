import prisma from './db';
import superjson from 'superjson';

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
    total
  });

  return serializedData.json;
}
