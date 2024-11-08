import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import superjson from 'superjson';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const artwork = await prisma.images.findFirst({
      where: {
        id: parseInt(params.id)
      }
    });
    
    if (!artwork) {
      return NextResponse.json(
        { error: '未找到该作品' },
        { status: 404 }
      );
    }

    // 使用 superjson 序列化数据
    const serialized = superjson.serialize(artwork);
    return NextResponse.json(serialized);
    
  } catch (error) {
    console.error("error:", error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
} 