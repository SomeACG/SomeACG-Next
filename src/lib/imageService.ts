import prisma from './db';

export async function getPaginatedImages(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const images = await prisma.images.findMany({
    skip,
    take,
    orderBy: {
      create_time: 'desc', // 根据需要排序
    },
  });

  // 将 BigInt 转换为字符串
  return images.map(image => ({
    ...image,
    userid: image.userid ? image.userid.toString() : null,
    authorid: image.authorid ? image.authorid.toString() : null,
  }));
}
