import prisma from '@/lib/db';
import { searchService, transformToSearchDocument, type SearchDocument } from './meilisearch-client';

// 索引服务类
export class IndexingService {
  // 批量索引现有的图片数据
  async indexExistingImages(batchSize: number = 100): Promise<void> {
    try {
      console.log('Starting to index existing images...');

      let offset = 0;
      let totalProcessed = 0;
      const totalCount = await prisma.image.count();

      console.log(`Total images to process: ${totalCount}`);

      while (offset < totalCount) {
        // 分批获取图片数据
        const images = await prisma.image.findMany({
          skip: offset,
          take: batchSize,
          orderBy: { id: 'asc' },
        });

        if (images.length === 0) break;

        // 获取这批图片的标签
        const pids = images.map((img) => img.pid).filter((pid): pid is string => pid !== null);
        const tags = await this.getTagsForPids(pids);

        // 转换为搜索文档
        const searchDocuments: SearchDocument[] = images.map((image) => {
          const imageTags = tags.get(image.pid || '') || [];
          return transformToSearchDocument(image, imageTags);
        });

        // 批量添加到 Meilisearch
        await searchService.addDocuments(searchDocuments);

        totalProcessed += images.length;
        offset += batchSize;

        console.log(`Processed ${totalProcessed}/${totalCount} images (${Math.round((totalProcessed / totalCount) * 100)}%)`);

        // 避免内存溢出，适当延时
        if (totalProcessed % (batchSize * 10) === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log(`Successfully indexed ${totalProcessed} images`);
    } catch (error) {
      console.error('Failed to index existing images:', error);
      throw error;
    }
  }

  // 索引单个图片
  async indexSingleImage(imageId: number): Promise<void> {
    try {
      const image = await prisma.image.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        throw new Error(`Image with id ${imageId} not found`);
      }

      // 获取图片标签
      const tags = image.pid ? await this.getTagsForPids([image.pid]) : new Map();
      const imageTags = tags.get(image.pid || '') || [];

      // 转换为搜索文档并索引
      const searchDocument = transformToSearchDocument(image, imageTags);
      await searchService.updateDocuments([searchDocument]);

      console.log(`Successfully indexed image ${imageId}`);
    } catch (error) {
      console.error(`Failed to index image ${imageId}:`, error);
      throw error;
    }
  }

  // 从索引中删除图片
  async removeImageFromIndex(imageId: number): Promise<void> {
    try {
      await searchService.deleteDocuments([imageId.toString()]);
      console.log(`Successfully removed image ${imageId} from index`);
    } catch (error) {
      console.error(`Failed to remove image ${imageId} from index:`, error);
      throw error;
    }
  }

  // 重新索引指定的图片
  async reindexImages(imageIds: number[]): Promise<void> {
    try {
      console.log(`Reindexing ${imageIds.length} images...`);

      // 分批处理，避免一次性加载太多数据
      const batchSize = 50;

      for (let i = 0; i < imageIds.length; i += batchSize) {
        const batch = imageIds.slice(i, i + batchSize);

        const images = await prisma.image.findMany({
          where: { id: { in: batch } },
        });

        const pids = images.map((img) => img.pid).filter((pid): pid is string => pid !== null);
        const tags = await this.getTagsForPids(pids);

        const searchDocuments: SearchDocument[] = images.map((image) => {
          const imageTags = tags.get(image.pid || '') || [];
          return transformToSearchDocument(image, imageTags);
        });

        await searchService.updateDocuments(searchDocuments);
        console.log(`Reindexed batch ${i / batchSize + 1}/${Math.ceil(imageIds.length / batchSize)}`);
      }

      console.log(`Successfully reindexed ${imageIds.length} images`);
    } catch (error) {
      console.error('Failed to reindex images:', error);
      throw error;
    }
  }

  // 获取指定 PIDs 的标签
  private async getTagsForPids(pids: string[]): Promise<Map<string, string[]>> {
    if (pids.length === 0) return new Map();

    try {
      const imageTags = await prisma.imageTag.findMany({
        where: { pid: { in: pids } },
      });

      const tagsMap = new Map<string, string[]>();

      imageTags.forEach(({ pid, tag }) => {
        if (pid && tag) {
          const cleanTag = tag.replace(/^#+/, ''); // 移除标签开头的 #
          if (!tagsMap.has(pid)) {
            tagsMap.set(pid, []);
          }
          tagsMap.get(pid)!.push(cleanTag);
        }
      });

      return tagsMap;
    } catch (error) {
      console.error('Failed to get tags for PIDs:', error);
      return new Map();
    }
  }

  // 增量同步：同步最近更新的图片
  async syncRecentImages(hoursBack: number = 24): Promise<void> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

      console.log(`Syncing images updated since: ${cutoffTime.toISOString()}`);

      const recentImages = await prisma.image.findMany({
        where: {
          create_time: {
            gte: cutoffTime,
          },
        },
        orderBy: { create_time: 'desc' },
      });

      if (recentImages.length === 0) {
        console.log('No recent images to sync');
        return;
      }

      console.log(`Found ${recentImages.length} recent images to sync`);

      // 获取这些图片的标签
      const pids = recentImages.map((img) => img.pid).filter((pid): pid is string => pid !== null);
      const tags = await this.getTagsForPids(pids);

      // 转换为搜索文档
      const searchDocuments: SearchDocument[] = recentImages.map((image) => {
        const imageTags = tags.get(image.pid || '') || [];
        return transformToSearchDocument(image, imageTags);
      });

      // 更新到索引
      await searchService.updateDocuments(searchDocuments);
      console.log(`Successfully synced ${recentImages.length} recent images`);
    } catch (error) {
      console.error('Failed to sync recent images:', error);
      throw error;
    }
  }

  // 验证索引数据的一致性
  async validateIndex(): Promise<{ dbCount: number; indexCount: number; consistent: boolean }> {
    try {
      const dbCount = await prisma.image.count();
      const indexStats = await searchService.getIndexStats();
      const indexCount = indexStats?.numberOfDocuments || 0;

      return {
        dbCount,
        indexCount,
        consistent: dbCount === indexCount,
      };
    } catch (error) {
      console.error('Failed to validate index:', error);
      throw error;
    }
  }

  // 获取索引状态报告
  async getIndexReport(): Promise<{
    totalImages: number;
    indexedImages: number;
    indexHealth: 'healthy' | 'partial' | 'empty';
    lastSyncTime?: Date;
  }> {
    try {
      const dbCount = await prisma.image.count();
      const indexStats = await searchService.getIndexStats();
      const indexCount = indexStats?.numberOfDocuments || 0;

      let indexHealth: 'healthy' | 'partial' | 'empty' = 'empty';

      if (indexCount === 0) {
        indexHealth = 'empty';
      } else if (indexCount >= dbCount * 0.95) {
        // 95% 以上认为健康
        indexHealth = 'healthy';
      } else {
        indexHealth = 'partial';
      }

      return {
        totalImages: dbCount,
        indexedImages: indexCount,
        indexHealth,
        lastSyncTime: new Date(), // 实际项目中应该存储真实的同步时间
      };
    } catch (error) {
      console.error('Failed to get index report:', error);
      throw error;
    }
  }

  // 清理并重建整个索引
  async rebuildIndex(): Promise<void> {
    try {
      console.log('Starting index rebuild...');

      // 清空现有索引
      await searchService.clearIndex();
      console.log('Cleared existing index');

      // 重新索引所有图片
      await this.indexExistingImages();

      console.log('Index rebuild completed');
    } catch (error) {
      console.error('Failed to rebuild index:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const indexingService = new IndexingService();

// 数据库变更监听器（用于实时同步）
export class DatabaseChangeListener {
  // 图片创建后的处理
  async onImageCreated(imageId: number): Promise<void> {
    try {
      await indexingService.indexSingleImage(imageId);
    } catch (error) {
      console.error(`Failed to index newly created image ${imageId}:`, error);
    }
  }

  // 图片更新后的处理
  async onImageUpdated(imageId: number): Promise<void> {
    try {
      await indexingService.indexSingleImage(imageId);
    } catch (error) {
      console.error(`Failed to reindex updated image ${imageId}:`, error);
    }
  }

  // 图片删除后的处理
  async onImageDeleted(imageId: number): Promise<void> {
    try {
      await indexingService.removeImageFromIndex(imageId);
    } catch (error) {
      console.error(`Failed to remove deleted image ${imageId} from index:`, error);
    }
  }

  // 标签更新后的处理
  async onTagsUpdated(pid: string): Promise<void> {
    try {
      // 找到对应的图片并重新索引
      const image = await prisma.image.findFirst({
        where: { pid },
      });

      if (image) {
        await indexingService.indexSingleImage(image.id);
      }
    } catch (error) {
      console.error(`Failed to reindex image after tag update for pid ${pid}:`, error);
    }
  }
}

export const dbChangeListener = new DatabaseChangeListener();
