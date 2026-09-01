import postgres from 'postgres';

let client: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) throw new Error('DATABASE_URL is not configured');

  client ??= postgres(databaseUrl, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return client;
}

export async function ensureChatSchema() {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const sql = getDatabase();

    await sql`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id UUID PRIMARY KEY,
        visitor_name VARCHAR(80) NOT NULL DEFAULT 'Visitante',
        status VARCHAR(20) NOT NULL DEFAULT 'open'
          CHECK (status IN ('open', 'closed')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id BIGSERIAL PRIMARY KEY,
        conversation_id UUID NOT NULL
          REFERENCES chat_conversations(id) ON DELETE CASCADE,
        sender VARCHAR(20) NOT NULL
          CHECK (sender IN ('visitor', 'operator')),
        body VARCHAR(2000) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS chat_messages_conversation_created_idx
      ON chat_messages (conversation_id, created_at)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS chat_conversations_updated_idx
      ON chat_conversations (updated_at DESC)
    `;
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}

