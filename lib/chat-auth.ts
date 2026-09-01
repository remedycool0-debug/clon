const encoder = new TextEncoder();
const TOKEN_LIFETIME_MS = 8 * 60 * 60 * 1000;

function getAdminKey() {
  const key = process.env.CHAT_ADMIN_KEY;
  if (!key) throw new Error('CHAT_ADMIN_KEY is not configured');
  return key;
}

function toBase64Url(bytes: ArrayBuffer) {
  return Buffer.from(bytes).toString('base64url');
}

async function hmacKey(usage: KeyUsage[]) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getAdminKey()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage,
  );
}

export async function adminKeyMatches(candidate: string) {
  const key = await hmacKey(['sign']);
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode('operator-login'));
  const candidateKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(candidate),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const received = await crypto.subtle.sign(
    'HMAC',
    candidateKey,
    encoder.encode('operator-login'),
  );

  return toBase64Url(expected) === toBase64Url(received);
}

export async function createOperatorToken() {
  const payload = `${Date.now() + TOKEN_LIFETIME_MS}.${crypto.randomUUID()}`;
  const key = await hmacKey(['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifyOperatorRequest(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return false;

  const token = authorization.slice(7);
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [expiresAt, nonce, signature] = parts;
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= Date.now()) return false;
  if (!nonce || !signature) return false;

  try {
    const key = await hmacKey(['verify']);
    return crypto.subtle.verify(
      'HMAC',
      key,
      Buffer.from(signature, 'base64url'),
      encoder.encode(`${expiresAt}.${nonce}`),
    );
  } catch {
    return false;
  }
}

