import { InvestorPageFrame } from '@/components/investor-page-frame';
import { defaultInvestorPage } from '@/lib/investor-pages';

export default function Home() {
  return (
    <InvestorPageFrame
      page={defaultInvestorPage}
      title="Check Out Your Investment Professional | Investor.gov"
    />
  );
}
