type SiteConfig = {
  title: string; // 网站标题名称（banner 上）
  subtitle?: string; // 副标题
  name: string; // 作者名称
  description?: string; // 站点简介（一段话）
  site: string; // 站点线上域名 用于 RSS 生成等
  avatar?: string; // 站点头像 logo.png or url
};

export const siteConfig: SiteConfig = {
  title: 'Cosine Gallery', // 网站名称
  subtitle: '收藏爱与美好', // 副标题
  name: 'cosine',
  description: 'Cosine 🎨 Gallery 是一个精选的 ACG 图片频道网站，是一个收藏性质的图频网站～',
  site: 'https://pic.cosine.ren/',
  avatar: 'https://pic.cosine.ren/favicon.ico',
};

const { title, subtitle } = siteConfig;
export const seoConfig = {
  title: `${title}${subtitle ? ' | ' + subtitle : ''}`,
  description: 'Cosine 🎨 Gallery 是一个精选的 ACG 图片频道网站，是一个收藏性质的图频网站～',
  keywords: 'cos, cosine, ACG, 收藏, 图片, 频道, 画师, 插画, 二次元, 动漫, 爱与美好',
  url: 'https://pic.cosine.ren/',
};
