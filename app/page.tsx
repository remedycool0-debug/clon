import { ChatWidget } from '@/components/chat-widget';

export default function Home() {
  return (
    <main className="original-page-shell">
      <iframe
        className="original-page-frame"
        src="/investor-original.html"
        title="Check Out Your Investment Professional | Investor.gov"
      />
      <ChatWidget />
    </main>
  );
}
