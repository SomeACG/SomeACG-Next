import { getPaginatedImages, getTagByPids } from '@/lib/imageService';
import { genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { images } from '@prisma/client';
import dayjs from 'dayjs';
import { Feed } from 'feed';
import { NextResponse } from 'next/server';

const SITE_URL = 'https://pic.cosine.ren';

function cleanTitle(title: string | null): string {
  if (!title) return '无题';
  // 移除多余的空白字符
  return (
    title
      .trim()
      // 替换连续的空白字符为单个空格
      .replace(/\s+/g, ' ')
      // 移除开头的标签符号
      .replace(/^[#＃]\s*/, '') ||
    // 移除表情符号（可选）
    // .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    // 如果处理后为空，返回默认标题
    '无题'
  );
}
export async function GET() {
  try {
    // 获取最新的20张图片
    const rawData = (await getPaginatedImages(1, 20)) as { images: images[]; total: number };
    const { images } = rawData;
    const feed = new Feed({
      title: 'Cosine Gallery',
      description: '每天更新精选二次元插画',
      id: SITE_URL,
      link: SITE_URL,
      language: 'zh-CN',
      favicon: `${SITE_URL}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}`,
      updated: new Date(),
      generator: 'Cosine Gallery RSS Feed',
      feedLinks: {
        rss2: `${SITE_URL}/api/feed`,
      },
    });

    const allTags = await getTagByPids(images.map((image) => image?.pid || ''));
    // 添加图片条目
    images.forEach((image: images, idx) => {
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

    // 设置正确的Content-Type
    return new NextResponse(feed.rss2(), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('生成RSS feed时出错:', error);
    return NextResponse.json({ error: '生成RSS feed失败' }, { status: 500 });
  }
}
