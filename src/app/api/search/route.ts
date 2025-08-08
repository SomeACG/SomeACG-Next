import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/lib/search/meilisearch-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 获取查询参数
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const platform = searchParams.get('platform');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const r18 = searchParams.get('r18');
    const sort = searchParams.get('sort') || 'create_time:desc';

    // 构建过滤条件
    const filters: string[] = [];

    if (platform) {
      filters.push(`platform = "${platform}"`);
    }

    if (tags.length > 0) {
      // 支持多标签查询：tags IN ["tag1", "tag2"]
      const tagFilters = tags.map((tag) => `tags = "${tag.trim()}"`);
      filters.push(`(${tagFilters.join(' OR ')})`);
    }

    if (r18 !== null) {
      filters.push(`r18 = ${r18 === 'true'}`);
    }

    // 执行搜索
    const searchResult = await searchService.searchImages(query, {
      limit,
      offset,
      filter: filters.length > 0 ? filters : undefined,
      sort: [sort],
      attributesToHighlight: ['title', 'author', 'tags'],
      facets: ['platform', 'tags', 'r18', 'author'],
    });

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        hits: searchResult.hits,
        query: searchResult.query,
        total: searchResult.estimatedTotalHits,
        limit: searchResult.limit,
        offset: searchResult.offset,
        processingTimeMs: searchResult.processingTimeMs,
      },
    });
  } catch (error) {
    console.error('Search API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal search error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
