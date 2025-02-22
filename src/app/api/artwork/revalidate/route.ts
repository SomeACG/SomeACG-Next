import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 在更新作品后调用，刷新页面
 * 
/api/artwork/revalidate
body {
    artworkId: '123',
    secret: process.env.REVALIDATE_SECRET
}
 */
export async function POST(request: NextRequest) {
  try {
    const { artworkId, secret } = await request.json();

    // 验证密钥（应该使用环境变量）
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: '无效的密钥' }, { status: 401 });
    }

    if (!artworkId) {
      return NextResponse.json({ message: '缺少作品ID' }, { status: 400 });
    }

    // 重新验证特定作品页面
    revalidatePath(`/artwork/${artworkId}`);

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: '重新验证失败' }, { status: 500 });
  }
}
