import { NextResponse } from 'next/server';
import { getPaginatedImages } from '../../../lib/imageService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const result = await getPaginatedImages(page, pageSize);

  return NextResponse.json(result);
}
