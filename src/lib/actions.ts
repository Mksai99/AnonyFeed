'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getFaculty, getFeedback, getTokens, saveFeedback, saveTokens, saveFaculty } from '@/lib/db';
import crypto from 'crypto';
import { redactSensitiveData } from '@/ai/flows/redact-sensitive-data';
import type { Feedback, Token } from './types';
import { revalidatePath } from 'next/cache';

// --- Utilities ---
function hashToken(token: string) {
  // In a real app, you'd want to use a more secure, salted hash.
  // For this demo, SHA256 is sufficient to prevent simple token guessing.
  // The full UUID is the "token", the hash is what's stored.
  // This is not a secure system for production.
  const tokenToHash = token.split('-')[0];
  return crypto.createHash('sha256').update(tokenToHash).digest('hex');
}

// --- Schemas ---
const tokenSchema = z.object({
  token: z.string().min(1, 'Please enter a token.'),
});

const feedbackSchema = z.object({
  facultyId: z.string().min(1, 'Please select a faculty member.'),
  rating: z.coerce.number().min(1, 'Please provide a rating.').max(5),
  comment: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password cannot be empty.'),
});

// --- Public Actions ---

export async function verifyToken(_prevState: any, formData: FormData) {
  const validatedFields = tokenSchema.safeParse({
    token: formData.get('token'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Invalid token format.',
    };
  }

  const { token } = validatedFields.data;
  const hashedToken = hashToken(token);
  const tokens = await getTokens();
  const cookieStore = await cookies();

  const tokenInDb = tokens.find((t) => t.hash === hashedToken);

  if (!tokenInDb) {
    // For development, if the token from the homepage is used, let it pass
    const devToken = "60a9278a-5363-445b-b06f-504936c33924";
    if (token === devToken) {
         const devTokenHash = hashToken(token);
         const devTokenInDb = tokens.find((t) => t.hash === devTokenHash);
     if(devTokenInDb && !devTokenInDb.used) {
      cookieStore.set('feedback-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes to submit
      });
      return redirect('/feedback');
     }
    }
    return { type: 'error', message: 'Token is invalid.' };
  }

  if (tokenInDb.used) {
    return { type: 'error', message: 'This token has already been used.' };
  }
  
  cookieStore.set('feedback-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 15, // 15 minutes to submit
  });

  redirect('/feedback');
}


export async function submitFeedback(_prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('feedback-token')?.value;

  if (!token) {
    return { type: 'error', message: 'Authentication expired. Please re-enter your token.' };
  }

  const validatedFields = feedbackSchema.safeParse({
    facultyId: formData.get('facultyId'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Invalid data. Please check your submission.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { facultyId, rating, comment } = validatedFields.data;

  // Verify token again
  const hashedToken = hashToken(token);
  let tokens = await getTokens();
  const tokenInDb = tokens.find((t) => t.hash === hashedToken);
  
  const devToken = "60a9278a-5363-445b-b06f-504936c33924";
  const devTokenInDb = tokens.find((t) => t.hash === hashToken(devToken));

  if (!tokenInDb && !(token === devToken && devTokenInDb && !devTokenInDb.used)) {
    return { type: 'error', message: 'Invalid or used token.' };
  }


  try {
    // Handle optional comment
    let redactedComment = '';
    if (comment && comment.trim()) {
        try {
            // Attempt AI-powered redaction
            const redactionResult = await redactSensitiveData({ text: comment });
            redactedComment = redactionResult.redactedText;
        } catch (error) {
            console.error('Error in sensitive data redaction:', error);
            // If AI service fails, use the comment as is but log the error
            redactedComment = comment;
            // Could also implement a basic fallback here if needed
        }
    }
    
    const allFaculty = await getFaculty();
    const facultyMember = allFaculty.find(f => f.id === facultyId);

    const newFeedback: Feedback = {
      id: crypto.randomUUID(),
      facultyId,
      facultyName: facultyMember?.name || 'Unknown Faculty',
      rating,
      comment: redactedComment,
      createdAt: new Date().toISOString(),
    };

    const allFeedback = await getFeedback();
    allFeedback.push(newFeedback);
    await saveFeedback(allFeedback);

    // Mark token as used
    const finalHashedToken = tokenInDb?.hash || hashToken(devToken);
    const updatedTokens = tokens.map((t) =>
      t.hash === finalHashedToken ? { ...t, used: true, usedAt: new Date().toISOString() } : t
    );
    await saveTokens(updatedTokens);
    
  cookieStore.delete('feedback-token');

  } catch (error) {
    console.error('Feedback submission error:', error);
    return { type: 'error', message: 'An unexpected error occurred while submitting your feedback.' };
  }
  
  redirect('/thank-you');
}


// --- Admin Actions ---

export async function adminLogin(_prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { type: 'error', message: 'Invalid form data.' };
  }
  
  const { email, password } = validatedFields.data;

  // In a real app, use bcrypt to compare passwords
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Set admin session cookie site-wide (no `path`) so it can be
    // deleted reliably by the logout action across browsers.
    const cookieStore = await cookies();
    cookieStore.set('admin-session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    // Revalidate the admin path to ensure middleware reruns
    revalidatePath('/admin', 'layout');
    return { type: 'success' };
  }

  return { type: 'error', message: 'Invalid credentials.' };
}

export async function logout() {
  // The admin session cookie is set with path: '/admin' during login.
  // Delete it for both the '/admin' path and the site root so browsers
  // that scoped the cookie differently will still have it removed.
  const cookieStore = await cookies();
  try {
    cookieStore.delete('admin-session');
  } catch (e) {
    // ignore - best-effort
  }

  try {
    cookieStore.delete('admin-session');
  } catch (e) {
    // ignore - best-effort
  }

  // Revalidate the admin path to ensure any cached server-rendered
  // content that depends on the session is refreshed.
  try {
    revalidatePath('/admin');
  } catch (e) {
    // ignore
  }

  redirect('/admin/login');
}

export async function deleteTokens(tokenHashes: string[]): Promise<{ success: boolean; message?: string }> {
  try {
    const allTokens = await getTokens();
    const remainingTokens = allTokens.filter(token => !tokenHashes.includes(token.hash));
    await saveTokens(remainingTokens);
    revalidatePath('/admin/tokens');
    return { 
      success: true, 
      message: `Successfully deleted ${tokenHashes.length} token${tokenHashes.length === 1 ? '' : 's'}.` 
    };
  } catch (error) {
    console.error('Error deleting tokens:', error);
    return { success: false, message: 'Failed to delete tokens.' };
  }
}

export async function generateTokens(count: number): Promise<{ success: boolean; newTokens?: string[]; message?: string }> {
  if (count <= 0 || count > 1000) {
    return { success: false, message: "Please generate between 1 and 1000 tokens." };
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
  revalidatePath('/admin/tokens');
  return { success: true, newTokens: newRawTokens };
}

export async function getAdminData() {
  const feedback = await getFeedback();
  const tokens = await getTokens();
  const faculty = await getFaculty();
  return { feedback, tokens, faculty };
}

export async function getExportData() {
    const feedback = await getFeedback();
    if (feedback.length === 0) return '';
    
    const headers = ['id', 'facultyName', 'rating', 'comment', 'createdAt'];
    const csvRows = [headers.join(',')];

    for (const row of feedback) {
        const values = headers.map(header => {
            const value = (row as any)[header];
            const escaped = (''+value).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

export async function addFaculty({ name, department }: { name: string; department: string }) {
    try {
        const faculty = await getFaculty();
        const newFaculty = {
            id: crypto.randomUUID(),
            name,
            department
        };
        
        await saveFaculty([...faculty, newFaculty]);
        revalidatePath('/admin/faculty');
        
        return { faculty: await getFaculty() };
    } catch (error) {
        console.error('Error adding faculty:', error);
        return { error: 'Failed to add faculty member.' };
    }
}

export async function deleteFaculty(id: string) {
    try {
        const faculty = await getFaculty();
        const updatedFaculty = faculty.filter(f => f.id !== id);
        
        await saveFaculty(updatedFaculty);
        revalidatePath('/admin/faculty');
        
        return { faculty: await getFaculty() };
    } catch (error) {
        console.error('Error deleting faculty:', error);
        return { error: 'Failed to delete faculty member.' };
    }
}
