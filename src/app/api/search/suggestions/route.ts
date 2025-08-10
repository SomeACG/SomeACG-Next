import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/lib/search/meilisearch-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: [],
          query,
        },
      });
    }

    // 获取搜索建议
    const suggestions = await searchService.getSuggestions(query, limit);

    return NextResponse.json({
      success: true,
      data: {
        suggestions: suggestions.map((text) => ({
          text,
          type: 'general', // 可以根据匹配来源标识类型
        })),
        query,
      },
    });
  } catch (error) {
    console.error('Search suggestions API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal suggestions error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
