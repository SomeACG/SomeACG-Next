import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // 这里模拟搜索结果
  const results = [
    { id: 1, title: `搜索结果: ${query}` },
    { id: 2, title: `另一个结果: ${query}` },
  ];

  return NextResponse.json(results);
}
