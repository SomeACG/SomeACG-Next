import { Metadata } from 'next';
import TagCloudClient from './_components/TagCloudClient';

export const metadata: Metadata = {
  title: '标签云 - Cosine Gallery',
  description: 'Cosine Gallery 的标签云页面，展示所有标签及其使用次数',
};

export default function TagCloudPage() {
  return <TagCloudClient />;
}
