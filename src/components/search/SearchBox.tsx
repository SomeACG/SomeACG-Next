'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { useSearchSuggestions } from '@/lib/hooks/useSearch';
import { useDebounceValue } from '@/hooks/useDebounce';

interface SearchBoxProps {
  initialQuery?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export function SearchBox({
  initialQuery = '',
  placeholder = '搜索图片、标签、画师...',
  onSearch,
  className = '',
  showSuggestions = true,
  autoFocus = false,
}: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounceValue(query, 300);
  const { suggestions, isLoading } = useSearchSuggestions(debouncedQuery, { enabled: showSuggestions && isFocused });

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 处理搜索提交
  const handleSubmit = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      onSearch?.(finalQuery);
      router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSubmit(suggestion);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex].text);
        } else {
          handleSubmit();
        }
        break;

      case 'Escape':
        setIsFocused(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // 清空搜索
  const handleClear = () => {
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // 处理焦点事件
  const handleFocus = () => {
    setIsFocused(true);
    setSelectedIndex(-1);
  };

  const handleBlur = () => {
    // 延迟关闭，允许点击建议
    setTimeout(() => {
      setIsFocused(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const showSuggestionsList = showSuggestions && isFocused && suggestions.length > 0 && query.length >= 2;

  return (
    <div className={`relative w-full ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="block w-full rounded-full border border-gray-200/50 bg-white/80 py-2.5 pr-12 pl-10 text-sm shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/90 focus:border-blue-400 focus:bg-white focus:shadow-md focus:ring-2 focus:ring-blue-400/50 dark:border-gray-600/50 dark:bg-gray-800/80 dark:text-white dark:placeholder-gray-400 dark:hover:bg-gray-800/90 dark:focus:bg-gray-800"
        />

        {/* 右侧按钮区域 */}
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}

          {query && (
            <button
              onClick={handleClear}
              className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              type="button"
              aria-label="清空搜索"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 搜索建议下拉列表 */}
      {showSuggestionsList && (
        <div
          ref={suggestionsRef}
          className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-200/50 bg-white/90 shadow-lg backdrop-blur-md dark:border-gray-600/50 dark:bg-gray-800/90"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 ${
                index === selectedIndex
                  ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-900 dark:text-gray-100'
              } ${index === 0 ? 'rounded-t-xl' : ''} ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span>{suggestion.text}</span>
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-600">
                    {suggestion.type || 'general'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
