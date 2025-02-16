import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedImages, getTagByPids } from '@/lib/imageService';
import { genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { Feed } from 'feed';
import dayjs from 'dayjs';

const SITE_URL = 'https://pic.cosine.ren';

function cleanTitle(title: string | null): string {
  if (!title) return '无题';
  return (
    title
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^[#＃]\s*/, '') || '无题'
  );
}

async function generateFeed() {
  const rawData = (await getPaginatedImages(1, 20)) as { images: any[]; total: number };
  const { images } = rawData;
  const feed = new Feed({
    title: 'Cosine 🎨 Gallery | 精选 ACG 好图壁纸集',
    image: 'https://pic.cosine.ren/favicon.ico',
    description: '质量超高的 ACG 图片列表，包好看的！',
    id: SITE_URL,
    link: SITE_URL,
    language: 'zh-CN',
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    updated: new Date(),
    generator: 'Cosine Gallery RSS Feed',
    feedLinks: {
      rss2: `${SITE_URL}/feed.xml`,
    },
  });

  const allTags = await getTagByPids(images.map((image) => image?.pid || ''));

  images.forEach((image: any, idx) => {
    const { platform, pid, author, rawurl, thumburl, width, height } = image;
    const imageUrl = transformPixivUrl(rawurl || '');
    const thumbUrl = transformPixivUrl(thumburl || '');
    const originUrl = genArtworkUrl({ platform: platform ?? '', pid: pid ?? '', username: author ?? '' });
    const createDate = dayjs(image?.create_time);
    const tags = allTags[idx];
    feed.addItem({
      title: cleanTitle(image.title),
      id: image.id.toString(),
      link: `${SITE_URL}/artwork/${image.id}`,
      description: `<div><img src="${thumbUrl}" alt="${image.title || '无题'}" /><p>平台: ${image?.platform || '未知'}</p><p>画师: ${image.author || '未知'}</p><p>原图链接: <a href="${originUrl}" target="_blank">${originUrl}</a></p><p>尺寸: ${width}x${height}</p>${
        tags?.length ? `<p>标签:${tags.map(({ tag }) => '#' + tag?.replace(/#/g, '')).join(' ')}</p>` : ''
      }</div>`,
      author: [
        {
          name: image?.author || '未知画师',
        },
      ],
      date: createDate.toDate(),
      image: imageUrl,
    });
  });

  return feed.rss2();
}

export async function GET(request: NextRequest) {
  try {
    const feedContent = await generateFeed();
    return new NextResponse(feedContent, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('生成RSS feed时出错:', error);
    return NextResponse.json({ error: '生成RSS feed失败' }, { status: 500 });
  }
}
