import { NextResponse } from 'next/server';

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

export async function POST() {
  const cookieOptions = ['HttpOnly', 'SameSite=Lax'];
  if (process.env.NODE_ENV === 'production') cookieOptions.push('Secure');

  // Clear cookie for site root
  const setCookieRoot = `admin-session=; Max-Age=0; Path=/; ${cookieOptions.join('; ')}`;
  // Clear cookie for /admin path as well
  const setCookieAdmin = `admin-session=; Max-Age=0; Path=/admin; ${cookieOptions.join('; ')}`;

  const res = NextResponse.json({ success: true });
  res.headers.append('Set-Cookie', setCookieRoot);
  res.headers.append('Set-Cookie', setCookieAdmin);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}
