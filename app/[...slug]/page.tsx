import { InvestorPageFrame } from '@/components/investor-page-frame';
import { defaultInvestorPage, investorPages } from '@/lib/investor-pages';

type InvestorRouteProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function InvestorRoute({ params }: InvestorRouteProps) {
  const { slug } = await params;
  const pathname = `/${slug.join('/')}`;
  const page = investorPages[pathname] ?? defaultInvestorPage;

  return <InvestorPageFrame page={page} />;
}

