# Cosine 🎨 Gallery 网站

图库网站，用于频道 [@CosineGallery](https://t.me/CosineGallery)

## 开发步骤

启动

```bash
pnpm i
pnpm db:init # 如果是全新启动，第一次启动前使用，初始化数据库， 见 [prisma](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production#create-and-apply-migrations)

pnpm pm2 # pm2 启动守护进程，配置文件见 ecosystem.config.js
#or
pnpm start # 直接终端起方便调试，可以 Ctrl+C 中断
```

其他命令（问就是个人习惯）：

```bash
pnpm pm2:stop # = pm2 stop ecosystem.config.js
pnpm pm2:restart # = pm2 restart ecosystem.config.js
pnpm pm2:log # = pm2 log ecosystem.config.js
```

.env.example 复制一份变成 .env，填入自己的环境变量

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
NEXT_PUBLIC_PIXIV_PROXY_URL=https://pixiv.proxy.url
NEXT_PUBLIC_SITE_URL=https://site.url # 用于站点 SEO 和 RSS
NEXT_PUBLIC_IMG_ORIGIN=https://your-s3-origin-url.com/origin # 原图链接（自己的S3图源）选填，没有的话会使用上面填入的 PIXIV 代理

REVALIDATE_SECRET=your_revalidate_secret # 用于 revalidate 的密钥 选填

# Meilisearch 搜索配置 选填
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY= # adminKey
```

## MeiliSearch 搜索配置

需要先初始化 Meilisearch 索引。按以下正确的顺序执行：

1. 检查 Meilisearch 连接状态

首先确认你的 .env.local 配置正确，然后检查索引状态：

```bash
curl http://localhost:6645/api/search/admin
```

2. 初始化 Meilisearch 索引配置

```json
curl -X POST http://localhost:6645/api/search/admin \
 -H "Content-Type: application/json" \
 -d '{"action": "initialize"}'
```

这个步骤会：

- 创建 images 索引
- 配置搜索字段 (title, author, tags, platform)
- 配置过滤字段 (platform, author, tags, r18, ai)
- 配置排序字段 (create_time, width, height)

3. 索引现有图片数据

```bash
curl -X POST http://localhost:6645/api/search/admin \
 -H "Content-Type: application/json" \
 -d '{"action": "index_all", "batchSize": 100}'
```

这个命令会：

- 分批处理所有张图片（每批 100 张）
- 提取图片的标题、作者、标签等信息
- 将数据索引到 Meilisearch

索引过程可能需要几分钟时间。你会看到类似这样的进度：

```bash
Processed 100/3270 images (3%)
Processed 200/3270 images (6%)
```

4. 监控进度

在索引过程中，你可以用这个命令监控进度：

```bash
curl http://localhost:6645/api/search/admin
```

状态会从：

- "indexHealth": "empty" → "partial" → "healthy"
- "indexedImages" 会逐渐增加

5. 验证索引状态

```bash
curl http://localhost:6645/api/search/admin
```

应该会返回类似：

```json
{
  "success": true,
  "data": {
    "totalImages": 1000,
    "indexedImages": 1000,
    "indexHealth": "healthy"
  }
}
```

### 🚨 如果遇到连接问题

如果上面的命令都失败，可能是环境变量配置问题。请确认：

1. 检查你的 .env.local 文件：

   - MEILISEARCH_HOST 是否正确
   - MEILISEARCH_API_KEY 是否使用了 Admin API Key

2. 测试 Meilisearch 连接：

```bash
curl -H "Authorization: Bearer 你的Admin_API_Key" \
 http://你的Meilisearch地址/health
```

3. 重启开发服务器
