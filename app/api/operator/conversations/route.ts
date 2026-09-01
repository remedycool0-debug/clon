import { verifyOperatorRequest } from '@/lib/chat-auth';
import { ensureChatSchema, getDatabase } from '@/lib/db';
import { cleanText, json, serverError, validUuid } from '@/lib/chat-http';

export async function GET(request: Request) {
  if (!(await verifyOperatorRequest(request))) return json({ error: 'Acceso no autorizado.' }, 401);
  try {
    await ensureChatSchema();
    const sql = getDatabase();
    const conversations = await sql`
      SELECT conversation.id::text, conversation.visitor_name, conversation.status,
        conversation.created_at, conversation.updated_at,
        latest.body AS last_message, latest.sender AS last_sender
      FROM chat_conversations AS conversation
      LEFT JOIN LATERAL (
        SELECT body, sender FROM chat_messages
        WHERE conversation_id = conversation.id
        ORDER BY created_at DESC, id DESC LIMIT 1
      ) AS latest ON TRUE
      ORDER BY CASE WHEN conversation.status = 'open' THEN 0 ELSE 1 END,
        conversation.updated_at DESC
      LIMIT 100
    `;
    return json({ conversations });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  if (!(await verifyOperatorRequest(request))) return json({ error: 'Acceso no autorizado.' }, 401);
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const conversationId = payload.conversationId;
    const status = cleanText(payload.status, 20);
    if (!validUuid(conversationId) || !['open', 'closed'].includes(status)) {
      return json({ error: 'Solicitud inválida.' }, 400);
    }
    await ensureChatSchema();
    const sql = getDatabase();
    await sql`UPDATE chat_conversations SET status = ${status}, updated_at = NOW() WHERE id = ${conversationId}`;
    return json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
