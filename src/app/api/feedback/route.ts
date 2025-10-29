import { NextResponse } from 'next/server';
import { getFeedback, saveFeedback } from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    const ids = idsParam ? idsParam.split(',') : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No feedback ids provided' }, { status: 400 });
    }

    const allFeedback = await getFeedback();
    const remaining = allFeedback.filter(f => !ids.includes(f.id));
    await saveFeedback(remaining);

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
