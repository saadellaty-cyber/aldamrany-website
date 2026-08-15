import { NextResponse } from 'next/server';
import { requireUserAction } from '@/lib/auth/guard';
import { listMediaForPicker } from '@/lib/admin/media';

export const runtime = 'nodejs';

/** Backs the image picker dialog. Requires an authenticated dashboard user. */
export async function GET(request: Request) {
  try {
    await requireUserAction();
  } catch {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get('q') ?? undefined;
  const items = await listMediaForPicker(query);

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      url: item.url,
      name: item.originalName,
      alt: item.altEn ?? item.altAr ?? '',
      width: item.width,
      height: item.height,
      blurDataUrl: item.blurDataUrl,
    })),
  });
}
