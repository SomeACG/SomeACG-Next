import { NextResponse } from 'next/server';

export async function GET() {
  // 这里模拟一些数据
  const items = [
    { id: 1, title: '项目1' },
    { id: 2, title: '项目2' },
    { id: 3, title: '项目3' },
  ];

  return NextResponse.json(items);
}
