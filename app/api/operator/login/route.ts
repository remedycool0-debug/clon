import { adminKeyMatches, createOperatorToken } from '@/lib/chat-auth';
import { cleanText, json, serverError } from '@/lib/chat-http';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const key = cleanText(payload.key, 300);
    if (!key || !(await adminKeyMatches(key))) {
      return json({ error: 'La clave no es correcta.' }, 401);
    }
    return json({ token: await createOperatorToken() });
  } catch (error) {
    return serverError(error);
  }
}
