import { getPaginatedImages } from '@/lib/imageService';
import { ImageList } from './components/ImageList';
import superjson from 'superjson';

export default async function Home() {
  // 在服务端获取第一页数据
  const initialData = await getPaginatedImages(1, 20);
  const serializedData = superjson.serialize(initialData);

  return <ImageList initialData={superjson.deserialize(serializedData)} />;
}
