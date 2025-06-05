import styleText from 'data-text:../styles.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from 'plasmo';
import { useEffect, useState } from 'react';

import { useStorage } from '@plasmohq/storage/hook';

import type { AccountMapping } from '~shared/accountMapping';
import { waitForElement } from '~shared/utilities/waitForElement';

export const config: PlasmoCSConfig = {
  matches: ['https://*.console.aws.amazon.com/*', 'https://health.aws.amazon.com/*'],
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.querySelector('div[data-testid="awsc-nav-scallop-icon-container"]')!,
  insertPosition: 'beforebegin',
});

export const getStyle: PlasmoGetStyle = () => {
  let textContent = styleText;
  textContent += `
    #plasmo-shadow-container {
      height: 100%;

      display: flex;
      align-items: center;
      justify-content: center;

      font-family: 'Amazon Ember', 'Helvetica Neue', Roboto, Arial, sans-serif;
    }`;

  const style = document.createElement('style');
  style.textContent = textContent;
  return style;
};

const ConsoleHeader = () => {
  const [accountMappings] = useStorage<AccountMapping[]>('accountMappings', []);

  const [accountId, setAccountId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [toggleRole, setToggleRole] = useState<boolean>(false);

  useEffect(() => {
    const findAccountMenu = async () => {
      const accountDetailMenu = await waitForElement('div[data-testid="account-detail-menu"]');

      const awsAccountNumberRegex = /\d{4}-\d{4}-\d{4}/;
      const consoleFederatedLoginRegex = /AWSReservedSSO_(.+)_(.+)/;

      const candidateSpans = accountDetailMenu.querySelectorAll('span');

      for (const span of Array.from(candidateSpans)) {
        if (span.textContent && awsAccountNumberRegex.test(span.textContent)) {
          setAccountId(span.textContent.replaceAll('-', ''));
          break;
        }
      }

      for (const span of Array.from(candidateSpans)) {
        const accountDetail = (span.textContent || '').split('/')[0].match(consoleFederatedLoginRegex);
        if (accountDetail && accountDetail.length > 1) {
          setRoleName(accountDetail[1]);
          break;
        }
      }
    };

    findAccountMenu();
  }, []);

  const matchedAccount = accountMappings.find((m) => m.accountId == accountId);
  if (!matchedAccount) {
    return (
      <div className="rounded-md py-1 px-2 font-semibold select-none bg-teal-100 text-slate-800">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    );
  }

  const { name, backgroundColour, textColour } = matchedAccount;

  return (
    <div
      className="bg-(--bg-colour) text-(--text-colour) rounded-md py-1 px-2 font-semibold select-none"
      style={{ '--bg-colour': backgroundColour, '--text-colour': textColour } as React.CSSProperties}
      onClick={() => setToggleRole((v) => !v)}>
      {name} {toggleRole && `: ${roleName}`}
    </div>
  );
};

export default ConsoleHeader;
