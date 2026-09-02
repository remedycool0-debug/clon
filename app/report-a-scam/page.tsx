import type { Metadata } from 'next';
import { InvestorPageFrame } from '@/components/investor-page-frame';

const title = 'Report a Scam | Reporting & Asset Recovery Guide';
const description = 'Learn how to report a scam, preserve evidence, protect your accounts, and understand asset recovery options.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: [] },
  twitter: { card: 'summary', title, description, images: [] },
};

export default function ReportScamPage() {
  return <InvestorPageFrame page="report-a-scam" title={title} />;
}
