import { investorGlobalMenuPages } from '@/lib/investor-global-menu-pages.generated';
import { investorSidebarPages } from '@/lib/investor-sidebar-pages.generated';

export const investorPages: Record<string, string> = {
  '/investor-home': 'home',
  '/introduction-investing/getting-started/five-questions-ask-you-invest':
    'five-questions-ask-you-invest',
  '/introduction-investing/getting-started/understanding-fees': 'understanding-fees',
  '/introduction-investing/getting-started/asset-allocation': 'asset-allocation',
  '/introduction-investing/getting-started/investing-your-own': 'investing-your-own',
  '/introduction-investing/getting-started/investing-your-own/online-investing':
    'online-investing',
  '/introduction-investing/getting-started/investing-your-own/direct-investing':
    'direct-investing',
  '/introduction-investing/getting-started/working-investment-professional':
    'working-investment-professional',
  '/introduction-investing/getting-started/working-investment-professional/brokers': 'brokers',
  '/introduction-investing/getting-started/working-investment-professional/using-brokercheck':
    'using-brokercheck',
  '/introduction-investing/getting-started/working-investment-professional/investment-advisers':
    'investment-advisers',
  '/introduction-investing/getting-started/working-investment-professional/investment-advisers-0':
    'investment-adviser-registration',
  '/introduction-investing/getting-started/working-investment-professional/check-out-your-investment-professional':
    'check-out-your-investment-professional',
  '/introduction-investing/getting-started/working-investment-professional/using-iapd': 'using-iapd',
  '/introduction-investing/getting-started/working-investment-professional/sec-action-lookup':
    'using-sali',
  '/introduction-investing/getting-started/working-investment-professional/ask-questions':
    'ask-questions',
  ...investorSidebarPages,
  ...investorGlobalMenuPages,
};

export const defaultInvestorPage = 'check-out-your-investment-professional';
