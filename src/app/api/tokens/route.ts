import { NextResponse } from 'next/server';
import { getTokens, saveTokens } from '@/lib/db';
import crypto from 'crypto';
import type { Token } from '@/lib/types';

function hashToken(token: string) {
  const tokenToHash = token.split('-')[0];
  return crypto.createHash('sha256').update(tokenToHash).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { count } = await request.json();
    
    if (count <= 0 || count > 1000) {
      return NextResponse.json(
        { error: "Please generate between 1 and 1000 tokens." },
        { status: 400 }
      );
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
    
    return NextResponse.json({
      success: true,
      tokens: newHashedTokens,
      rawTokens: newRawTokens,
    });
  } catch (error) {
    console.error('Error generating tokens:', error);
    return NextResponse.json(
      { error: 'Failed to generate tokens' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenHashes = searchParams.get('hashes')?.split(',') || [];

    if (tokenHashes.length === 0) {
      return NextResponse.json(
        { error: 'No tokens specified for deletion' },
        { status: 400 }
      );
    }

    const allTokens = await getTokens();
    const remainingTokens = allTokens.filter(
      token => !tokenHashes.includes(token.hash)
    );
    
    await saveTokens(remainingTokens);
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${tokenHashes.length} token(s)`,
    });
  } catch (error) {
    console.error('Error deleting tokens:', error);
    return NextResponse.json(
      { error: 'Failed to delete tokens' },
      { status: 500 }
    );
  }
}