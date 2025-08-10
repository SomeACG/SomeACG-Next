'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { SearchParams } from '@/lib/hooks/useSearch';
import { cn } from '@/lib/utils';

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

const COMMON_TAGS = [
  '甜妹',
  '靓仔',
  '可爱',
  '头像',
  '方形',
  '壁纸',
  '风景',
  '原神',
  '崩坏星穹铁道',
  '白色系',
  '粉色系',
  '红色系',
  '蓝色系',
];

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
      <div className={cn('rounded-xl border bg-white', 'border-gray-200 dark:border-gray-700 dark:bg-gray-800')}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-between',
              'p-4 text-left transition-colors',
              'hover:bg-gray-50 dark:hover:bg-gray-700/50',
            )}
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              <span className="font-medium text-gray-700 dark:text-gray-300">筛选</span>
              {hasActiveFilters && (
                <span className={cn('rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white')}>
                  {
                    [
                      currentFilters.platform && '平台',
                      currentFilters.tags.length > 0 && `标签(${currentFilters.tags.length})`,
                      currentFilters.r18 !== undefined && '内容分级',
                      currentFilters.sort !== 'create_time:desc' && '排序',
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </div>
            <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className={cn(
                'mr-4 cursor-pointer rounded-md px-3 py-1',
                'text-sm text-red-600 transition-colors',
                'hover:bg-red-50 hover:text-red-700',
                'dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300',
              )}
            >
              清除筛选
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className={cn('border-t border-gray-100 px-4 pb-3 dark:border-gray-700')}>
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
                <FilterTag label={currentFilters.r18 ? 'nsfw' : '全年龄'} onRemove={() => onFilterChange({ r18: undefined })} />
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

      {isExpanded && (
        <div
          className={cn(
            'absolute top-full right-0 left-0 z-50 mt-2',
            'rounded-xl border bg-white shadow-xl',
            'border-gray-200 dark:border-gray-700 dark:bg-gray-800',
            'transition-all duration-200 ease-out',
          )}
        >
          <div className="space-y-6 p-6">
            <FilterSection title="平台">
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((platform) => (
                  <FilterButton
                    key={platform.value}
                    onClick={() => handlePlatformChange(platform.value)}
                    isSelected={currentFilters.platform === platform.value}
                    variant="blue"
                  >
                    {platform.label}
                  </FilterButton>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="标签">
              <div className="mb-3 flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="输入标签名..."
                  className={cn(
                    'flex-1 rounded-xl border px-3 py-2 text-sm',
                    'border-gray-300 bg-white text-gray-900',
                    'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100',
                    'focus:border-blue-500 focus:ring-2 focus:ring-blue-500',
                  )}
                />
                <button
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim()}
                  className={cn(
                    'cursor-pointer rounded-xl bg-blue-500 px-4 py-2',
                    'text-sm text-white hover:bg-blue-600',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  添加
                </button>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">常用标签：</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      disabled={currentFilters.tags.includes(tag)}
                      className={cn(
                        'cursor-pointer rounded-md px-2 py-1 text-xs',
                        'bg-gray-100 text-gray-600 hover:bg-gray-200',
                        'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </FilterSection>

            <FilterSection title="内容分级">
              <div className="flex space-x-2">
                <FilterButton onClick={() => handleR18Change(true)} isSelected={currentFilters.r18 === true} variant="red">
                  nsfw
                </FilterButton>
                <FilterButton onClick={() => handleR18Change(false)} isSelected={currentFilters.r18 === false} variant="green">
                  全年龄
                </FilterButton>
              </div>
            </FilterSection>

            <FilterSection title="排序方式">
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((sort) => (
                  <FilterButton
                    key={sort.value}
                    onClick={() => handleSortChange(sort.value)}
                    isSelected={currentFilters.sort === sort.value}
                    variant="purple"
                  >
                    {sort.label}
                  </FilterButton>
                ))}
              </div>
            </FilterSection>
          </div>
        </div>
      )}
    </div>
  );
}

// 过滤器标签组件
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div
      className={cn(
        'inline-flex items-center space-x-1 rounded-full px-2 py-1 text-sm',
        'bg-blue-100 text-blue-800',
        'dark:bg-blue-900 dark:text-blue-200',
      )}
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className={cn('cursor-pointer rounded-full p-0.5', 'hover:bg-blue-200 dark:hover:bg-blue-800')}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// 过滤器区块组件
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={cn('mb-2 block text-sm font-medium', 'text-gray-700 dark:text-gray-300')}>{title}</label>
      {children}
    </div>
  );
}

// 过滤器按钮组件
interface FilterButtonProps {
  onClick: () => void;
  isSelected: boolean;
  variant: 'blue' | 'red' | 'green' | 'purple';
  children: React.ReactNode;
}

function FilterButton({ onClick, isSelected, variant, children }: FilterButtonProps) {
  const variantStyles = {
    blue: isSelected
      ? 'border-blue-500 bg-blue-500 text-white'
      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
    red: isSelected
      ? 'border-red-500 bg-red-500 text-white'
      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
    green: isSelected
      ? 'border-green-500 bg-green-500 text-white'
      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
    purple: isSelected
      ? 'border-purple-500 bg-purple-500 text-white'
      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
  };

  return (
    <button
      onClick={onClick}
      className={cn('cursor-pointer rounded-full border px-3 py-1.5', 'text-sm transition-colors', variantStyles[variant])}
    >
      {children}
    </button>
  );
}
