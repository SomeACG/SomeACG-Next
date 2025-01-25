'use client';

import Card from '@/components/ui/card';
import Lottie from '@lottielab/lottie-player/react';

export default function About() {
  return (
    <Card className="p-20 text-xl">
      <h2 className="text-2xl font-bold">About</h2>
      <p>Cosine 🎨 Gallery 是一个精选的 ACG 图片列表，旨在为用户提供高质量的图片资源。</p>
      <p>此处我必须要晒出我精心设计的 Logo 喵</p>
      <Lottie src="https://cdn.lottielab.com/l/APXV8RHbvRVEoH.json" className="max-h-[37.5rem]" />
      <h3 className="text-xl font-bold">2025-01-15 初版发布</h3>
      <p>
        可以先用啦，最核心的简单的看图功能有了，待添加的功能和优化还有很多，比如标签和标签筛选什么的。
        由于数据库还是要兼容之前的 sqlite 数据库，所以更新不是实时，可能随缘同步，等 bot 迁移到 PostgreSQL
        之后就可以实时更新了。 理论上只要是
        <a
          href="https://github.com/SomeACG/cosine-pic-bot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue transition hover:underline"
        >
          cosine-pic-bot
        </a>
        妲喵的 bot 驱动的图库频道就可以部署，但是他的标签结构太阴间了，等优化完了估计就不兼容了 <br />
      </p>
      <h3 className="text-xl font-bold">2025-01-25 加入移动端两列适配 完善功能</h3>
      <p>TODO:标签、友链页面、检索、反馈、SEO 优化、UI 优化、 MDX 页面！</p>
    </Card>
  );
}
