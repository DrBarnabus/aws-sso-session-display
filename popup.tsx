import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useStorage } from '@plasmohq/storage/hook';

import type { AccountMapping } from '~shared/accountMapping';

import 'styles.css';

import { getContrastingTextColour } from '~shared/utilities/getContrastingTextColour';

function IndexPopup() {
  const [persistedMappings, setPersistedMappings] = useStorage<AccountMapping[]>('accountMappings', []);

  const [editableMappings, setEditableMappings] = useState<AccountMapping[]>([]);

  useEffect(() => {
    setEditableMappings(persistedMappings);
  }, [persistedMappings]);

  return (
    <div className="min-w-160 flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100">
      <div className="flex gap-4 w-full items-center">
        <h1 className="text-3xl font-bold mr-auto">AWS SSO Session Display</h1>

        <button
          className="rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 size-9 flex items-center justify-center active:text-indigo-300"
          onClick={() => {
            const backgroundColour = `#${(Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6)}`;
            setEditableMappings([
              ...editableMappings,
              {
                uuid: uuidv4(),
                accountId: '',
                name: '',
                backgroundColour,
                textColour: getContrastingTextColour(backgroundColour),
              },
            ]);
          }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>

        <button
          className="rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 size-9 flex items-center justify-center active:text-indigo-300"
          onClick={async () => {
            await setPersistedMappings(editableMappings);
          }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
            <path d="M7 3v4a1 1 0 0 0 1 1h7" />
          </svg>
        </button>
      </div>

      <div className="mt-2 w-full flex flex-col gap-2">
        {!editableMappings.length && (
          <div className="text-xl font-medium text-slate-700 dark:text-slate-300 w-full text-center">
            No account mappings
          </div>
        )}
        {editableMappings.map((mapping, index) => (
          <div
            key={mapping.uuid}
            className="flex border border-slate-800 dark:border-slate-700 rounded-md px-4 py-2 gap-4 flex-nowrap items-center">
            <div>
              <label className="block text-sm/6 font-medium" htmlFor="accountId">
                Account ID
              </label>
              <input
                className="block rounded-md bg-slate-50 px-3 py-1.5 text-base text-slate-900 outline-1 -outline-offset-1 outline-slate-300 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-2 focus:outline-idigo-500 sm:text-sm/6 invalid:bg-rose-100"
                type="text"
                id="accountId"
                value={mapping.accountId}
                onChange={(e) => {
                  const newEditableMappings = [...editableMappings];
                  newEditableMappings[index] = {
                    ...mapping,
                    accountId: e.target.value,
                  };
                  setEditableMappings(newEditableMappings);
                }}
                required
                pattern="\d{12}"
              />
            </div>

            <div>
              <label className="block text-sm/6 font-medium" htmlFor="name">
                Name
              </label>
              <input
                className="block rounded-md bg-slate-50 px-3 py-1.5 text-base text-slate-900 outline-1 -outline-offset-1 outline-slate-300 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-2 focus:outline-idigo-500 sm:text-sm/6 invalid:bg-rose-100"
                type="text"
                id="name"
                value={mapping.name}
                onChange={(e) => {
                  const newEditableMappings = [...editableMappings];
                  newEditableMappings[index] = {
                    ...mapping,
                    name: e.target.value,
                  };
                  setEditableMappings(newEditableMappings);
                }}
                required
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm/6 font-medium" htmlFor="backgroundColour">
                Colour
              </label>
              <input
                className="block rounded-md bg-transparent text-base text-slate-900 focus:outline-2 focus:-outline-offset-2 focus:outline-idigo-500 h-9 w-20"
                type="color"
                id="backgroundColour"
                value={mapping.backgroundColour}
                onChange={(e) => {
                  const newEditableMappings = [...editableMappings];
                  newEditableMappings[index] = {
                    ...mapping,
                    backgroundColour: e.target.value,
                    textColour: getContrastingTextColour(e.target.value),
                  };
                  setEditableMappings(newEditableMappings);
                }}
              />
            </div>

            <button
              className="rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 size-9 flex items-center justify-center active:text-indigo-300"
              onClick={() => {
                setEditableMappings(editableMappings.filter((m) => m.uuid !== mapping.uuid));
              }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndexPopup;
