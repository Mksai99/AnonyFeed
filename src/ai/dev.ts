import { config } from 'dotenv';
config();

import '@/ai/flows/redact-sensitive-data.ts';
import '@/ai/flows/suggest-feedback-improvements.ts';