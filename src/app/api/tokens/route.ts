import { NextResponse } from 'next/server';
import { getTokens, saveTokens } from '@/lib/db';
import crypto from 'crypto';
import type { Token } from '@/lib/types';

function hashToken(token: string) {
  const tokenToHash = token.split('-')[0];
  return crypto.createHash('sha256').update(tokenToHash).digest('hex');
}

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

export async function POST(request: Request) {
  try {
    const { count } = await request.json();

    if (count <= 0 || count > 1000) {
      const res = NextResponse.json(
        { error: "Please generate between 1 and 1000 tokens." },
        { status: 400 }
      );
      Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    const allTokens = await getTokens();
    const newRawTokens: string[] = [];
    const newHashedTokens: Token[] = [];

    for (let i = 0; i < count; i++) {
      const rawToken = crypto.randomUUID();
      const hashedToken = hashToken(rawToken);

      newRawTokens.push(rawToken);
      newHashedTokens.push({
        hash: hashedToken,
        used: false,
        createdAt: new Date().toISOString(),
      });
    }

    await saveTokens([...allTokens, ...newHashedTokens]);

    const res = NextResponse.json({
      success: true,
      tokens: newHashedTokens,
      rawTokens: newRawTokens,
    });
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch (error) {
    console.error('Error generating tokens:', error);
    const res = NextResponse.json(
      { error: 'Failed to generate tokens' },
      { status: 500 }
    );
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenHashes = searchParams.get('hashes')?.split(',') || [];

    if (tokenHashes.length === 0) {
      const res = NextResponse.json(
        { error: 'No tokens specified for deletion' },
        { status: 400 }
      );
      Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    const allTokens = await getTokens();
    const remainingTokens = allTokens.filter(
      token => !tokenHashes.includes(token.hash)
    );

    await saveTokens(remainingTokens);

    const res = NextResponse.json({
      success: true,
      message: `Successfully deleted ${tokenHashes.length} token(s)`,
    });
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch (error) {
    console.error('Error deleting tokens:', error);
    const res = NextResponse.json(
      { error: 'Failed to delete tokens' },
      { status: 500 }
    );
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }
}