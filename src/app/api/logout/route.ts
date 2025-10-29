import { NextResponse } from 'next/server';

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
  return res;
}
