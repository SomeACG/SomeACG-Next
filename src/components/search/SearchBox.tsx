'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { useSearchSuggestions } from '@/lib/hooks/useSearch';
import { useDebounceValue } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'motion/react';
import { useOutsideClick } from '@/hooks/useOutsideClick';

interface SearchBoxProps {
  initialQuery?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
  compact?: boolean; // 新增紧凑模式
}

export function SearchBox({
  initialQuery = '',
  placeholder = '搜索图片、标签、画师...',
  onSearch,
  className = '',
  showSuggestions = true,
  autoFocus = false,
  compact = false,
}: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(!compact); // 紧凑模式默认收起
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounceValue(query, 300);
  const { suggestions, isLoading } = useSearchSuggestions(debouncedQuery, { enabled: showSuggestions && isFocused });

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 点击外部时关闭聚焦/建议，并在紧凑模式下无输入时收起
  const onOutside = useCallback(() => {
    setIsFocused(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
    if (compact && !query.trim()) {
      setIsExpanded(false);
    }
  }, [compact, query]);

  useOutsideClick(containerRef, onOutside, { enabled: true, events: ['mousedown', 'touchstart'], passive: true });

  // 处理搜索提交
  const handleSubmit = (searchQuery?: string) => {
    const finalQuery = searchQuery !== undefined ? searchQuery : query;
    onSearch?.(finalQuery);
    router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
    setIsFocused(false);
    inputRef.current?.blur();
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

  // 处理展开/收起
  const handleExpand = () => {
    if (compact && !isExpanded) {
      setIsExpanded(true);
      // 延迟聚焦，等待动画完成
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  };

  // 处理焦点事件
  const handleFocus = () => {
    setIsFocused(true);
    setSelectedIndex(-1);
    if (compact && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleBlur = () => {
    // 延迟关闭，允许点击建议
    setTimeout(() => {
      setIsFocused(false);
      setSelectedIndex(-1);
      // 如果是紧凑模式且没有输入内容，则收起
      if (compact && !query.trim()) {
        setIsExpanded(false);
      }
    }, 200);
  };

  const showSuggestionsList = showSuggestions && isFocused && suggestions.length > 0 && query.length >= 2 && isExpanded;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {compact && !isExpanded ? (
          // 紧凑模式 - 搜索图标
          <motion.button
            key="compact"
            onClick={handleExpand}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </motion.button>
        ) : (
          // 展开模式 - 完整搜索框
          <motion.div
            key="expanded"
            className="group relative"
            initial={compact ? { width: 40, opacity: 0 } : { width: '100%', opacity: 1 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />

            <motion.input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="h-10 w-full rounded-xl border-0 bg-gray-50 pr-12 pl-12 text-gray-900 placeholder-gray-500 shadow-sm transition-all focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            />

            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center space-x-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              {query && (
                <button
                  onClick={handleClear}
                  className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                  type="button"
                  aria-label="清空搜索"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSuggestionsList && (
        <div
          ref={suggestionsRef}
          className="absolute top-full right-0 left-0 z-50 mt-3 max-h-60 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className={`block w-full px-4 py-3 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{suggestion.text}</span>
                <span className="ml-2 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {suggestion.type || 'search'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
