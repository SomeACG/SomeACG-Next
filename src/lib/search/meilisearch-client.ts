import { MeiliSearch } from 'meilisearch';

// Meilisearch 客户端配置
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';

// 创建 Meilisearch 客户端实例
export const meiliClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

// 索引名称常量
export const INDEXES = {
  IMAGES: 'images',
} as const;

// 搜索文档类型定义
export interface SearchDocument {
  id: string;
  title?: string;
  author?: string;
  platform?: string;
  tags: string[];
  pid?: string;
  authorid?: string;
  width?: number;
  height?: number;
  filename?: string;
  thumburl?: string;
  rawurl?: string;
  create_time?: string;
  r18?: boolean;
  ai?: boolean;
  
  // 用于搜索的组合字段
  searchable_content: string;
}

// 搜索结果类型
export interface SearchResult<T = SearchDocument> {
  hits: T[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

// 搜索选项
export interface SearchOptions {
  limit?: number;
  offset?: number;
  filter?: string[];
  facets?: string[];
  attributesToHighlight?: string[];
  attributesToCrop?: string[];
  sort?: string[];
}

// 初始化 Meilisearch 索引
export async function initializeMeilisearch(): Promise<void> {
  try {
    console.log('Initializing Meilisearch...');
    
    // 创建或获取图片索引
    const imagesIndex = meiliClient.index(INDEXES.IMAGES);
    
    // 等待索引创建完成
    try {
      const stats = await imagesIndex.getStats();
      console.log('Index exists:', stats);
    } catch (error) {
      // 索引可能不存在，创建它
      await meiliClient.createIndex(INDEXES.IMAGES, { primaryKey: 'id' });
    }
    
    // 配置搜索属性
    await imagesIndex.updateSearchableAttributes([
      'title',
      'author', 
      'tags',
      'searchable_content',
      'platform'
    ]);
    
    // 配置可过滤属性
    await imagesIndex.updateFilterableAttributes([
      'platform',
      'author',
      'tags',
      'r18',
      'ai',
      'width',
      'height',
      'create_time'
    ]);
    
    // 配置可排序属性
    await imagesIndex.updateSortableAttributes([
      'create_time',
      'width',
      'height'
    ]);
    
    // 配置同义词（可选）
    await imagesIndex.updateSynonyms({
      'pixiv': ['p站', 'pix'],
      'twitter': ['推特', 'x'],
      'anime': ['动漫', '动画'],
      'manga': ['漫画']
    });
    
    // 配置停用词（可选，减少噪音）
    await imagesIndex.updateStopWords(['the', 'a', 'an', 'and', 'or', 'but']);
    
    console.log('Meilisearch initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize Meilisearch:', error);
    throw error;
  }
}

// 将数据库图片转换为搜索文档
export function transformToSearchDocument(image: any, tags: string[] = []): SearchDocument {
  // 创建搜索内容的组合字段
  const searchableContent = [
    image.title || '',
    image.author || '',
    ...tags,
    image.platform || ''
  ].filter(Boolean).join(' ');

  return {
    id: image.id.toString(),
    title: image.title || undefined,
    author: image.author || undefined,
    platform: image.platform || undefined,
    tags: tags.filter(tag => tag && tag.trim() !== ''),
    pid: image.pid || undefined,
    authorid: image.authorid?.toString() || undefined,
    width: image.width || undefined,
    height: image.height || undefined,
    filename: image.filename || undefined,
    thumburl: image.thumburl || undefined,
    rawurl: image.rawurl || undefined,
    create_time: image.create_time?.toISOString() || undefined,
    r18: image.r18 || false,
    ai: image.ai || false,
    searchable_content: searchableContent
  };
}

// 基础搜索服务类
export class MeilisearchService {
  private imagesIndex;

  constructor() {
    this.imagesIndex = meiliClient.index(INDEXES.IMAGES);
  }

  // 添加文档到索引
  async addDocuments(documents: SearchDocument[]): Promise<void> {
    try {
      const task = await this.imagesIndex.addDocuments(documents);
      // 等待任务完成，但不阻塞太久
      console.log(`Added ${documents.length} documents, task ID: ${task.taskUid}`);
    } catch (error) {
      console.error('Failed to add documents:', error);
      throw error;
    }
  }

  // 更新文档
  async updateDocuments(documents: SearchDocument[]): Promise<void> {
    try {
      const task = await this.imagesIndex.updateDocuments(documents);
      console.log(`Updated ${documents.length} documents, task ID: ${task.taskUid}`);
    } catch (error) {
      console.error('Failed to update documents:', error);
      throw error;
    }
  }

  // 删除文档
  async deleteDocuments(documentIds: string[]): Promise<void> {
    try {
      const task = await this.imagesIndex.deleteDocuments(documentIds);
      console.log(`Deleted ${documentIds.length} documents, task ID: ${task.taskUid}`);
    } catch (error) {
      console.error('Failed to delete documents:', error);
      throw error;
    }
  }

  // 搜索图片
  async searchImages(
    query: string, 
    options: SearchOptions = {}
  ): Promise<SearchResult<SearchDocument>> {
    try {
      const searchOptions = {
        limit: options.limit || 20,
        offset: options.offset || 0,
        filter: options.filter || [],
        facets: options.facets || ['platform', 'tags', 'r18'],
        attributesToHighlight: options.attributesToHighlight || ['title', 'author', 'tags'],
        attributesToCrop: options.attributesToCrop || ['title'],
        sort: options.sort || ['create_time:desc'],
        ...options
      };

      const result = await this.imagesIndex.search(query, searchOptions);
      
      return {
        hits: result.hits as SearchDocument[],
        query: result.query,
        processingTimeMs: result.processingTimeMs,
        limit: result.limit,
        offset: result.offset,
        estimatedTotalHits: result.estimatedTotalHits || 0
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  // 按标签搜索
  async searchByTag(tag: string, options: SearchOptions = {}): Promise<SearchResult<SearchDocument>> {
    const filter = [`tags = "${tag}"`];
    if (options.filter) {
      filter.push(...options.filter);
    }
    
    return this.searchImages('', { ...options, filter });
  }

  // 按画师搜索
  async searchByArtist(artist: string, options: SearchOptions = {}): Promise<SearchResult<SearchDocument>> {
    return this.searchImages(`author:"${artist}"`, options);
  }

  // 按平台搜索
  async searchByPlatform(platform: string, options: SearchOptions = {}): Promise<SearchResult<SearchDocument>> {
    const filter = [`platform = "${platform}"`];
    if (options.filter) {
      filter.push(...options.filter);
    }
    
    return this.searchImages('', { ...options, filter });
  }

  // 获取搜索建议
  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      // Meilisearch 没有专门的建议 API，我们使用搜索来模拟
      const result = await this.imagesIndex.search(query, {
        limit: limit,
        attributesToRetrieve: ['title', 'author', 'tags']
      });

      const suggestions = new Set<string>();
      
      result.hits.forEach((hit: any) => {
        // 从标题、作者、标签中提取建议
        if (hit.title && hit.title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(hit.title);
        }
        if (hit.author && hit.author.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(hit.author);
        }
        if (hit.tags) {
          hit.tags.forEach((tag: string) => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
              suggestions.add(tag);
            }
          });
        }
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }

  // 获取索引统计信息
  async getIndexStats(): Promise<any> {
    try {
      const stats = await this.imagesIndex.getStats();
      return stats;
    } catch (error) {
      console.error('Failed to get index stats:', error);
      return null;
    }
  }

  // 清空索引
  async clearIndex(): Promise<void> {
    try {
      const task = await this.imagesIndex.deleteAllDocuments();
      console.log(`Clearing index, task ID: ${task.taskUid}`);
    } catch (error) {
      console.error('Failed to clear index:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const searchService = new MeilisearchService();