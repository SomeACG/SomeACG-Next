import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // 这里模拟获取详细信息
  const detail = {
    id: parseInt(id),
    title: `项目 ${id} 的详细信息`,
    description: '这是一个详细描述...',
  };

  return NextResponse.json(detail);
}
