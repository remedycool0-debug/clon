import { ChatWidget } from '@/components/chat-widget';

type InvestorPageFrameProps = {
  page: string;
  title?: string;
};

export function InvestorPageFrame({ page, title = 'Investor.gov' }: InvestorPageFrameProps) {
  return (
    <main className="original-page-shell">
      <iframe
        className="original-page-frame"
        src={`/investor-pages/${page}.html`}
        title={title}
      />
      <ChatWidget />
    </main>
  );
}

