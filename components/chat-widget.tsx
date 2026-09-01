'use client';

import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle, MessageCircle, Send, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ChatMessage = {
  id: string;
  sender: 'visitor' | 'operator';
  body: string;
  created_at: string;
};

const VISITOR_ID_KEY = 'support_chat_visitor_id';
const VISITOR_NAME_KEY = 'support_chat_visitor_name';

function visitorId() {
  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(VISITOR_ID_KEY, created);
  return created;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/chat/messages?conversationId=${encodeURIComponent(visitorId())}`,
        { cache: 'no-store' },
      );
      if (!response.ok) return;
      const data = (await response.json()) as { messages?: ChatMessage[] };
      setMessages(data.messages ?? []);
      setReady(true);
    } catch {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setName(localStorage.getItem(VISITOR_NAME_KEY) ?? '');
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => void loadMessages(), 0);
    const interval = window.setInterval(loadMessages, 3000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [open, loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function sendMessage(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;

    setSending(true);
    setError('');
    if (name.trim()) localStorage.setItem(VISITOR_NAME_KEY, name.trim());

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: visitorId(),
          visitorName: name,
          message,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'No se pudo enviar el mensaje.');
      setDraft('');
      await loadMessages();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="support-widget">
      {open && (
        <section className="support-panel" aria-label="Chat de asistencia">
          <header className="support-header">
            <div className="support-agent-mark" aria-hidden="true"><MessageCircle /></div>
            <div>
              <strong>Asistencia en línea</strong>
              <span><i /> Estamos disponibles</span>
            </div>
            <Button type="button" variant="ghost" size="icon" className="support-close" onClick={() => setOpen(false)} aria-label="Cerrar chat">
              <X />
            </Button>
          </header>

          <div className="support-messages" aria-live="polite">
            {!ready && <div className="support-loading"><LoaderCircle /> Cargando conversación…</div>}
            {ready && messages.length === 0 && (
              <div className="support-welcome">
                <div className="support-welcome-icon"><Check /></div>
                <strong>¿Cómo podemos ayudarte?</strong>
                <p>Déjanos tu consulta y una persona del equipo te responderá aquí.</p>
              </div>
            )}
            {messages.map((message) => (
              <div className={`support-message ${message.sender === 'visitor' ? 'is-visitor' : 'is-operator'}`} key={message.id}>
                <span>{message.sender === 'visitor' ? 'Tú' : 'Asistencia'}</span>
                <p>{message.body}</p>
                <time>{new Date(message.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</time>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form className="support-form" onSubmit={sendMessage}>
            {messages.length === 0 && (
              <Input value={name} onChange={(event) => setName(event.target.value)} className="support-name" placeholder="Tu nombre (opcional)" maxLength={80} aria-label="Tu nombre" />
            )}
            <div className="support-compose">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Escribe tu mensaje…"
                maxLength={2000}
                rows={2}
                aria-label="Mensaje"
              />
              <Button type="submit" size="icon" className="support-send" disabled={!draft.trim() || sending} aria-label="Enviar mensaje">
                {sending ? <LoaderCircle className="spin" /> : <Send />}
              </Button>
            </div>
            {error && <p className="support-error" role="alert">{error}</p>}
            <small>No compartas contraseñas ni información financiera confidencial.</small>
          </form>
        </section>
      )}

      <Button type="button" className={`support-launcher ${open ? 'is-open' : ''}`} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Cerrar chat' : 'Abrir chat de asistencia'}>
        {open ? <X /> : <MessageCircle />}
        {!open && <span>¿Necesitas ayuda?</span>}
      </Button>
    </div>
  );
}
