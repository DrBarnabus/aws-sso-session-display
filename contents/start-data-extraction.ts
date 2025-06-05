import type { PlasmoCSConfig } from 'plasmo';
import { v4 as uuidv4 } from 'uuid';

import { Storage } from '@plasmohq/storage';

import type { AccountMapping } from '~shared/accountMapping';
import { getContrastingTextColour } from '~shared/utilities/getContrastingTextColour';
import { waitForElement } from '~shared/utilities/waitForElement';

export const config: PlasmoCSConfig = {
  matches: ['https://*.awsapps.com/start#/', 'https://*.awsapps.com/start/*'],
};

const storage = new Storage();

(async () => {
  const mappings = (await storage.get<AccountMapping[]>('accountMappings')) ?? [];

  const accountListElement = await waitForElement('div[data-testid="account-list"]');
  const accountListButtonElements = Array.from(
    accountListElement.querySelectorAll('button[data-testid="account-list-cell"]'),
  );

  for (const accountButtonElement of accountListButtonElements) {
    let accountId: string | undefined;
    for (const divElement of Array.from(accountButtonElement.querySelectorAll('div'))) {
      accountId = divElement.textContent?.match(/\d{12}/)?.toString();
      if (accountId) break;
    }

    const name = accountButtonElement.querySelector('strong')?.textContent;

    if (!accountId || !name) continue;
    if (mappings.some((m) => m.accountId === accountId)) continue;

    const backgroundColour = `#${(Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6)}`;
    mappings.push({
      uuid: uuidv4(),
      accountId,
      name,
      backgroundColour,
      textColour: getContrastingTextColour(backgroundColour),
    });
  }

  await storage.set('accountMappings', mappings);
})();
