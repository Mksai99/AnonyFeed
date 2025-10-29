'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Faculty, Token, Feedback } from '@/lib/types';

// In a production environment, use a proper database instead of JSON files.
// For Vercel, you could use Vercel KV or Vercel Postgres.
// For this scaffolding, we use JSON files for simplicity.

const dataPath = path.join(process.cwd(), 'src', 'data');

async function readData<T>(filename: string): Promise<T> {
  const filePath = path.join(dataPath, filename);
  try {
    await fs.access(filePath);
  } catch {
    // If the file doesn't exist, create it with a default value
    const defaultContent = filename.endsWith('.json') ? '[]' : '';
    await fs.writeFile(filePath, defaultContent, 'utf-8');
  }

  try {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  // Handle case where file is empty
  return (fileContent ? JSON.parse(fileContent) : []) as unknown as T;
  } catch (error) {
    console.error(`Error reading or parsing ${filename}:`, error);
    throw new Error(`Could not read data from ${filename}`);
  }
}

async function writeData<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(dataPath, filename);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${filename}:`, error);
    throw new Error(`Could not write data to ${filename}`);
  }
}

// Faculty
export const getFaculty = async () => await readData<Faculty[]>('faculty.json');
export const saveFaculty = async (faculty: Faculty[]) => await writeData('faculty.json', faculty);

// Tokens
export const getTokens = async () => await readData<Token[]>('tokens.json');
export const saveTokens = async (tokens: Token[]) => await writeData('tokens.json', tokens);

// Feedback
export const getFeedback = async () => await readData<Feedback[]>('feedback.json');
export const saveFeedback = async (feedback: Feedback[]) => await writeData('feedback.json', feedback);
