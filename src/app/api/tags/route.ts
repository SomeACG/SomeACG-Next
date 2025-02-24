import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tags = await prisma.imageTag.groupBy({
      by: ['tag'],
      _count: {
        tag: true,
      },
      orderBy: {
        _count: {
          tag: 'desc',
        },
      },
    });

    // 创建一个 Map 来存储清理后的标签和其计数
    const tagCountMap = new Map<string, number>();

    // 处理每个标签，移除开头的 # 并合并计数
    tags.forEach((t) => {
      if (t.tag) {
        const cleanTag = t.tag.replace(/^#+/, '');
        const currentCount = tagCountMap.get(cleanTag) || 0;
        tagCountMap.set(cleanTag, currentCount + t._count.tag);
      }
    });

    // 转换 Map 为数组并排序
    const filteredTags = Array.from(tagCountMap.entries())
      .map(([tag, count]) => ({
        tag,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json(filteredTags);
  } catch (error) {
    console.error('获取标签列表失败:', error);
    return NextResponse.json({ error: '获取标签列表失败' }, { status: 500 });
  }
}
