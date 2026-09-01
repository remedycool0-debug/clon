'use client';

import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Archive, CheckCircle2, Inbox, LoaderCircle, LockKeyhole, LogOut, MessageCircle, RefreshCw, Send, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Conversation = {
  id: string;
  visitor_name: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_sender: 'visitor' | 'operator' | null;
};

type ChatMessage = {
  id: string;
  sender: 'visitor' | 'operator';
  body: string;
  created_at: string;
};

const TOKEN_KEY = 'chat_operator_token';

export default function OperatorPage() {
  const [token, setToken] = useState('');
  const [key, setKey] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setConversations([]);
    setSelectedId('');
    setMessages([]);
    setLoading(false);
  }, []);

  const operatorFetch = useCallback(async (url: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
    });
    if (response.status === 401) logout();
    return response;
  }, [logout, token]);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const response = await operatorFetch('/api/operator/conversations');
      if (!response.ok) return;
      const data = (await response.json()) as { conversations?: Conversation[] };
      setConversations(data.conversations ?? []);
      setSelectedId((current) => current || data.conversations?.[0]?.id || '');
    } catch {
      setError('No se pudo actualizar la bandeja.');
    } finally {
      setLoading(false);
    }
  }, [operatorFetch, token]);

  const loadMessages = useCallback(async () => {
    if (!token || !selectedId) return;
    try {
      const response = await operatorFetch(`/api/operator/messages?conversationId=${encodeURIComponent(selectedId)}`);
      if (!response.ok) return;
      const data = (await response.json()) as { messages?: ChatMessage[] };
      setMessages(data.messages ?? []);
    } catch {
      setError('No se pudo cargar la conversación.');
    }
  }, [operatorFetch, selectedId, token]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = sessionStorage.getItem(TOKEN_KEY) ?? '';
      setToken(stored);
      setLoading(Boolean(stored));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!token) return;
    const timeout = window.setTimeout(() => void loadConversations(), 0);
    const interval = window.setInterval(loadConversations, 3000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [loadConversations, token]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    const timeout = window.setTimeout(() => void loadMessages(), 0);
    const interval = window.setInterval(loadMessages, 2500);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [loadMessages, selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function login(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/operator/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const data = (await response.json()) as { token?: string; error?: string };
      if (!response.ok || !data.token) throw new Error(data.error ?? 'No se pudo iniciar sesión.');
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setKey('');
      setLoading(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  async function reply(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || !selectedId) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await operatorFetch('/api/operator/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedId, message: draft }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'No se pudo enviar la respuesta.');
      setDraft('');
      await Promise.all([loadMessages(), loadConversations()]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo enviar la respuesta.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus() {
    const conversation = conversations.find((item) => item.id === selectedId);
    if (!conversation) return;
    await operatorFetch('/api/operator/conversations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: selectedId, status: conversation.status === 'open' ? 'closed' : 'open' }),
    });
    await loadConversations();
  }

  if (!token) {
    return (
      <main className="operator-login-page">
        <section className="operator-login-card">
          <div className="operator-lock"><LockKeyhole /></div>
          <p className="operator-eyebrow">Área privada</p>
          <h1>Panel de asistencia</h1>
          <p>Ingresa la clave de operador para ver y responder conversaciones.</p>
          <form onSubmit={login}>
            <label htmlFor="operator-key">Clave de acceso</label>
            <Input id="operator-key" type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="••••••••••••" autoComplete="current-password" />
            {error && <p className="operator-form-error" role="alert">{error}</p>}
            <Button type="submit" disabled={!key || submitting}>
              {submitting ? <LoaderCircle className="spin" /> : <LockKeyhole />} Entrar al panel
            </Button>
          </form>
        </section>
      </main>
    );
  }

  const selected = conversations.find((item) => item.id === selectedId);

  return (
    <main className="operator-dashboard">
      <aside className="operator-sidebar">
        <header className="operator-brand">
          <div><MessageCircle /></div>
          <span><strong>Asistencia</strong><small>Panel del operador</small></span>
        </header>
        <div className="operator-inbox-title">
          <span><Inbox /> Conversaciones</span>
          <Button variant="ghost" size="icon-sm" onClick={() => void loadConversations()} aria-label="Actualizar"><RefreshCw /></Button>
        </div>
        <div className="operator-conversation-list">
          {loading && <div className="operator-empty"><LoaderCircle className="spin" /> Cargando…</div>}
          {!loading && conversations.length === 0 && <div className="operator-empty"><Inbox /> Aún no hay conversaciones.</div>}
          {conversations.map((conversation) => (
            <button type="button" key={conversation.id} className={`operator-conversation ${selectedId === conversation.id ? 'is-selected' : ''}`} onClick={() => { setMessages([]); setSelectedId(conversation.id); }}>
              <span className="operator-avatar"><UserRound /></span>
              <span className="operator-conversation-copy">
                <span><strong>{conversation.visitor_name}</strong><time>{new Date(conversation.updated_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</time></span>
                <small>{conversation.last_sender === 'operator' ? 'Tú: ' : ''}{conversation.last_message}</small>
              </span>
              <i className={conversation.status === 'open' ? 'is-open' : ''} />
            </button>
          ))}
        </div>
        <Button variant="ghost" className="operator-logout" onClick={logout}><LogOut /> Cerrar sesión</Button>
      </aside>

      <section className="operator-chat">
        {selected ? (
          <>
            <header className="operator-chat-header">
              <span className="operator-avatar"><UserRound /></span>
              <div><strong>{selected.visitor_name}</strong><small>{selected.status === 'open' ? 'Conversación activa' : 'Conversación archivada'}</small></div>
              <Button variant="outline" onClick={() => void toggleStatus()}>
                {selected.status === 'open' ? <Archive /> : <CheckCircle2 />}{selected.status === 'open' ? 'Archivar' : 'Reabrir'}
              </Button>
            </header>
            <div className="operator-messages">
              {messages.map((message) => (
                <div key={message.id} className={`operator-message ${message.sender === 'operator' ? 'is-operator' : ''}`}>
                  <span>{message.sender === 'operator' ? 'Tú' : selected.visitor_name}</span>
                  <p>{message.body}</p>
                  <time>{new Date(message.created_at).toLocaleString('es', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</time>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form className="operator-reply" onSubmit={reply}>
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Escribe una respuesta…"
                rows={2}
                maxLength={2000}
              />
              <Button type="submit" disabled={!draft.trim() || submitting}>
                {submitting ? <LoaderCircle className="spin" /> : <Send />} Enviar
              </Button>
              {error && <p role="alert">{error}</p>}
            </form>
          </>
        ) : (
          <div className="operator-no-selection"><MessageCircle /><h2>Selecciona una conversación</h2><p>Los mensajes nuevos aparecerán automáticamente.</p></div>
        )}
      </section>
    </main>
  );
}
