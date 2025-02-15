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
      className="group not-prose relative flex flex-col items-center rounded-xl border border-gray-800/50 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-gray-700/50 hover:bg-gray-800/50"
    >
      {/* 背景光效 */}
      <div className="absolute inset-0 -z-10 h-full w-full rounded-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* 头像容器 */}
      {avatar && (
        <div className="relative mb-4 aspect-square size-20 overflow-hidden rounded ring-2 ring-gray-700/50 ring-offset-2 ring-offset-gray-900 transition-all duration-300 group-hover:ring-purple-500/50">
          <img
            src={avatar}
            alt={name}
            className="size-20 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      )}

      {/* 名称 */}
      <h3 className="bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-lg font-bold text-transparent transition-colors duration-300 group-hover:from-purple-300 group-hover:to-blue-300">
        {name}
      </h3>

      {/* 描述 */}
      {description && (
        <p className="mt-2 text-sm text-gray-400/90 transition-colors duration-300 group-hover:text-gray-300/90">
          {description}
        </p>
      )}

      {/* 装饰性元素 */}
      <div className="absolute -top-1 -right-1 h-20 w-20 rounded-full bg-purple-500/5 blur-2xl transition-all duration-300 group-hover:bg-purple-500/10" />
      <div className="absolute -bottom-1 -left-1 h-20 w-20 rounded-full bg-blue-500/5 blur-2xl transition-all duration-300 group-hover:bg-blue-500/10" />
    </Link>
  );
}
