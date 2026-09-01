import { ensureChatSchema, getDatabase } from '@/lib/db';
import { cleanText, json, serverError, validUuid } from '@/lib/chat-http';

export async function GET(request: Request) {
  const conversationId = new URL(request.url).searchParams.get('conversationId');
  if (!validUuid(conversationId)) return json({ messages: [] });

  try {
    await ensureChatSchema();
    const sql = getDatabase();
    const messages = await sql`
      SELECT id::text, sender, body, created_at
      FROM chat_messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC, id ASC
      LIMIT 200
    `;
    return json({ messages });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const conversationId = payload.conversationId;
    const visitorName = cleanText(payload.visitorName, 80) || 'Visitante';
    const body = cleanText(payload.message, 2000);

    if (!validUuid(conversationId) || !body) {
      return json({ error: 'Escribe un mensaje válido.' }, 400);
    }

    await ensureChatSchema();
    const sql = getDatabase();
    await sql.begin(async (transaction) => {
      await transaction`
        INSERT INTO chat_conversations (id, visitor_name)
        VALUES (${conversationId}, ${visitorName})
        ON CONFLICT (id) DO UPDATE SET
          visitor_name = CASE
            WHEN chat_conversations.visitor_name = 'Visitante' THEN EXCLUDED.visitor_name
            ELSE chat_conversations.visitor_name
          END,
          status = 'open',
          updated_at = NOW()
      `;
      await transaction`
        INSERT INTO chat_messages (conversation_id, sender, body)
        VALUES (${conversationId}, 'visitor', ${body})
      `;
    });
    return json({ ok: true }, 201);
  } catch (error) {
    return serverError(error);
  }
}
