'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { SearchParams } from '@/lib/hooks/useSearch';

interface SearchFiltersProps {
  currentFilters: {
    platform?: string;
    tags: string[];
    r18?: boolean;
    sort: string;
  };
  onFilterChange: (filters: Partial<SearchParams>) => void;
  onClear: () => void;
}

const PLATFORM_OPTIONS = [
  { value: 'pixiv', label: 'Pixiv' },
  { value: 'twitter', label: 'Twitter/X' },
];

const SORT_OPTIONS = [
  { value: 'create_time:desc', label: '最新优先' },
  { value: 'create_time:asc', label: '最旧优先' },
];

const COMMON_TAGS = ['anime', 'manga', 'character', 'original', 'fanart', 'illustration', 'digital', 'cute', 'girl', 'boy'];

export function SearchFilters({ currentFilters, onFilterChange, onClear }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭筛选面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isExpanded]);

  // 检查是否有活动的过滤器
  const hasActiveFilters = !!(
    currentFilters.platform ||
    currentFilters.tags.length > 0 ||
    currentFilters.r18 !== undefined ||
    currentFilters.sort !== 'create_time:desc'
  );

  // 处理平台过滤
  const handlePlatformChange = (platform: string) => {
    onFilterChange({
      platform: platform === currentFilters.platform ? undefined : platform,
    });
  };

  // 处理排序变化
  const handleSortChange = (sort: string) => {
    onFilterChange({ sort: sort as any });
  };

  // 处理 R18 过滤
  const handleR18Change = (r18: boolean) => {
    onFilterChange({
      r18: r18 === currentFilters.r18 ? undefined : r18,
    });
  };

  // 添加标签
  const addTag = (tag: string) => {
    if (tag.trim() && !currentFilters.tags.includes(tag.trim())) {
      onFilterChange({
        tags: [...currentFilters.tags, tag.trim()],
      });
    }
    setTagInput('');
  };

  // 移除标签
  const removeTag = (tagToRemove: string) => {
    onFilterChange({
      tags: currentFilters.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // 处理标签输入
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {/* 过滤器头部 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-1 items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              <span className="font-medium text-gray-700 dark:text-gray-300">筛选</span>
              {hasActiveFilters && (
                <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                  {
                    [
                      currentFilters.platform && '平台',
                      currentFilters.tags.length > 0 && `标签(${currentFilters.tags.length})`,
                      currentFilters.r18 !== undefined && 'R18',
                      currentFilters.sort !== 'create_time:desc' && '排序',
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform text-gray-400 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="mr-4 rounded-md px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            >
              清除筛选
            </button>
          )}
        </div>

        {/* 活动过滤器标签 */}
        {hasActiveFilters && (
          <div className="border-t border-gray-100 px-4 pb-3 dark:border-gray-700">
            <div className="flex flex-wrap gap-2 pt-3">
              {currentFilters.platform && (
                <FilterTag
                  label={`平台: ${PLATFORM_OPTIONS.find((p) => p.value === currentFilters.platform)?.label}`}
                  onRemove={() => onFilterChange({ platform: undefined })}
                />
              )}
              {currentFilters.tags.map((tag) => (
                <FilterTag key={tag} label={`标签: ${tag}`} onRemove={() => removeTag(tag)} />
              ))}
              {currentFilters.r18 !== undefined && (
                <FilterTag label={currentFilters.r18 ? 'R18' : '非R18'} onRemove={() => onFilterChange({ r18: undefined })} />
              )}
              {currentFilters.sort !== 'create_time:desc' && (
                <FilterTag
                  label={`排序: ${SORT_OPTIONS.find((s) => s.value === currentFilters.sort)?.label}`}
                  onRemove={() => onFilterChange({ sort: 'create_time:desc' })}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 展开的过滤器选项 - 绝对定位浮动面板 */}
      {isExpanded && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl transition-all duration-200 ease-out dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-6 p-6">
            {/* 平台过滤 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">平台</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((platform) => (
                  <button
                    key={platform.value}
                    onClick={() => handlePlatformChange(platform.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      currentFilters.platform === platform.value
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 标签过滤 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">标签</label>

              {/* 标签输入 */}
              <div className="mb-3 flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="输入标签名..."
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <button
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim()}
                  className="rounded-xl bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  添加
                </button>
              </div>

              {/* 常用标签 */}
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">常用标签：</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      disabled={currentFilters.tags.includes(tag)}
                      className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* R18 过滤 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">内容分级</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleR18Change(false)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    currentFilters.r18 === false
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  全年龄
                </button>
                <button
                  onClick={() => handleR18Change(true)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    currentFilters.r18 === true
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  R18
                </button>
              </div>
            </div>

            {/* 排序 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">排序方式</label>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((sort) => (
                  <button
                    key={sort.value}
                    onClick={() => handleSortChange(sort.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      currentFilters.sort === sort.value
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 过滤器标签组件
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center space-x-1 rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200">
      <span>{label}</span>
      <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
