export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export function validUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

export function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s{3,}/g, '  ').slice(0, maxLength);
}

export function serverError(error: unknown) {
  console.error(error);
  const message = error instanceof Error ? error.message : '';

  if (message.includes('is not configured')) {
    return json({ error: 'El chat todavía no está configurado en el servidor.' }, 503);
  }

  return json({ error: 'No pudimos completar la solicitud.' }, 500);
}

