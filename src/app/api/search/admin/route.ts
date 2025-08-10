import { indexingService } from '@/lib/search/indexing-service';
import { initializeMeilisearch } from '@/lib/search/meilisearch-client';
import { NextRequest, NextResponse } from 'next/server';

// 管理端点（用于初始化和管理搜索索引）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'initialize':
        // 初始化 Meilisearch 索引配置
        await initializeMeilisearch();
        return NextResponse.json({
          success: true,
          message: 'Meilisearch initialized successfully',
        });

      case 'index_all':
        // 索引所有现有图片
        const batchSize = params.batchSize || 100;
        await indexingService.indexExistingImages(batchSize);
        return NextResponse.json({
          success: true,
          message: 'All images indexed successfully',
        });

      case 'sync_recent':
        // 同步最近的图片
        const hours = params.hours || 24;
        await indexingService.syncRecentImages(hours);
        return NextResponse.json({
          success: true,
          message: `Recent images synced (${hours} hours)`,
        });

      case 'rebuild':
        // 重建整个索引
        await indexingService.rebuildIndex();
        return NextResponse.json({
          success: true,
          message: 'Index rebuilt successfully',
        });

      case 'validate':
        // 验证索引一致性
        const validation = await indexingService.validateIndex();
        return NextResponse.json({
          success: true,
          data: validation,
        });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Search admin API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal admin error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// 获取索引状态
export async function GET(request: NextRequest) {
  try {
    const report = await indexingService.getIndexReport();

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Search admin status error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get index status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
