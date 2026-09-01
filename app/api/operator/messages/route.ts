import { verifyOperatorRequest } from '@/lib/chat-auth';
import { ensureChatSchema, getDatabase } from '@/lib/db';
import { cleanText, json, serverError, validUuid } from '@/lib/chat-http';

export async function GET(request: Request) {
  if (!(await verifyOperatorRequest(request))) return json({ error: 'Acceso no autorizado.' }, 401);
  const conversationId = new URL(request.url).searchParams.get('conversationId');
  if (!validUuid(conversationId)) return json({ error: 'Conversación inválida.' }, 400);
  try {
    await ensureChatSchema();
    const sql = getDatabase();
    const messages = await sql`
      SELECT id::text, sender, body, created_at FROM chat_messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC, id ASC LIMIT 300
    `;
    return json({ messages });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  if (!(await verifyOperatorRequest(request))) return json({ error: 'Acceso no autorizado.' }, 401);
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const conversationId = payload.conversationId;
    const body = cleanText(payload.message, 2000);
    if (!validUuid(conversationId) || !body) return json({ error: 'Escribe una respuesta válida.' }, 400);
    await ensureChatSchema();
    const sql = getDatabase();
    const result = await sql.begin(async (transaction) => {
      const conversations = await transaction`
        UPDATE chat_conversations SET status = 'open', updated_at = NOW()
        WHERE id = ${conversationId} RETURNING id
      `;
      if (conversations.length === 0) return false;
      await transaction`
        INSERT INTO chat_messages (conversation_id, sender, body)
        VALUES (${conversationId}, 'operator', ${body})
      `;
      return true;
    });
    if (!result) return json({ error: 'La conversación ya no existe.' }, 404);
    return json({ ok: true }, 201);
  } catch (error) {
    return serverError(error);
  }
}
