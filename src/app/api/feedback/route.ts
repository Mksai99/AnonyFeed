import { NextResponse } from 'next/server';
import { getFeedback, saveFeedback } from '@/lib/db';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_CORS_ORIGIN ?? '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  const res = NextResponse.json({ ok: true });
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    const ids = idsParam ? idsParam.split(',') : [];

    if (ids.length === 0) {
      const res = NextResponse.json({ error: 'No feedback ids provided' }, { status: 400 });
      Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    const allFeedback = await getFeedback();
    const remaining = allFeedback.filter(f => !ids.includes(f.id));
    await saveFeedback(remaining);

    const res = NextResponse.json({ success: true, deleted: ids.length });
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch (err) {
    console.error('Error deleting feedback:', err);
    const res = NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }
}
