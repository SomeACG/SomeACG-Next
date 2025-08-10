import Link from 'next/link';

interface LinkCardProps {
  name: string;
  avatar?: string;
  description?: string;
  link: string;
}
export function LinkCard({ name, avatar, description, link }: LinkCardProps) {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group not-prose relative flex w-full flex-col items-center rounded-xl border border-gray-200/70 bg-white/70 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-gray-300/70 hover:bg-gray-50/70 dark:border-gray-800/50 dark:bg-gray-900/50 dark:hover:border-gray-700/50 dark:hover:bg-gray-800/50"
    >
      {/* 背景光效 */}
      <div className="absolute inset-0 -z-10 h-full w-full rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-purple-500/5 dark:to-blue-500/5" />

      {/* 头像容器 */}
      {avatar && (
        <div className="relative mb-4 aspect-square size-20 overflow-hidden rounded ring-2 ring-gray-200/70 ring-offset-2 ring-offset-white transition-all duration-300 group-hover:ring-purple-400/50 dark:ring-gray-700/50 dark:ring-offset-gray-900 dark:group-hover:ring-purple-500/50">
          <img
            src={avatar}
            alt={name}
            className="size-20 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      )}

      {/* 名称 */}
      <h3 className="from-primary to-primary group-hover:from-primary group-hover:to-primary bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent transition-colors duration-300 dark:from-purple-200 dark:to-blue-200 dark:group-hover:from-purple-300 dark:group-hover:to-blue-300">
        {name}
      </h3>

      {/* 描述 */}
      {description && (
        <p className="mt-2 text-sm text-gray-600/90 transition-colors duration-300 group-hover:text-gray-800/90 dark:text-gray-400/90 dark:group-hover:text-gray-300/90">
          {description}
        </p>
      )}

      {/* 装饰性元素 */}
      <div className="absolute -top-1 -right-1 h-20 w-20 rounded-full bg-purple-500/10 blur-2xl transition-all duration-300 group-hover:bg-purple-500/15 dark:bg-purple-500/5 dark:group-hover:bg-purple-500/10" />
      <div className="absolute -bottom-1 -left-1 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl transition-all duration-300 group-hover:bg-blue-500/15 dark:bg-blue-500/5 dark:group-hover:bg-blue-500/10" />
    </Link>
  );
}
