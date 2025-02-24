import { getPaginatedImages } from '@/lib/imageService';
import { ImageList } from './components/ImageList';
import { RandomImage } from './components/RandomImage';
import superjson from 'superjson';
import { DEFAULT_PAGE_SIZE } from '@/constants';

export default async function Home() {
  // 在服务端获取第一页数据
  const initialData = await getPaginatedImages(1, DEFAULT_PAGE_SIZE);
  const serializedData = superjson.serialize(initialData);
  return (
    <div className="space-y-8">
      <RandomImage />
      <ImageList initialData={superjson.deserialize(serializedData)} />
    </div>
  );
}
