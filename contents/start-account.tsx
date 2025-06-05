import styleText from 'data-text:../styles.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useStorage } from '@plasmohq/storage/hook';

import type { AccountMapping } from '~shared/accountMapping';

export const config: PlasmoCSConfig = {
  matches: ['https://*.awsapps.com/start#/', 'https://*.awsapps.com/start/*'],
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchors = document.querySelectorAll('button[data-testid="account-list-cell"]');
  return anchors;
};

export const getStyle: PlasmoGetStyle = () => {
  let textContent = styleText;
  textContent += `
    #plasmo-shadow-container {
      font-family: 'Amazon Ember', 'Helvetica Neue', Roboto, Arial, sans-serif;
    }`;

  const style = document.createElement('style');
  style.textContent = textContent;
  return style;
};

const StartAccount = ({ anchor: { element: anchorElement } }: { anchor: { element: HTMLElement } }) => {
  const [accountMappings] = useStorage<AccountMapping[]>('accountMappings', []);
  const [accountId, setAccountId] = useState<string | null>(null);

  const selfRef = useRef<HTMLDivElement>(null);
  const [styles, setStyles] = useState<React.CSSProperties | null>(null);

  const anchorRef = useRef(anchorElement);
  useEffect(() => {
    anchorRef.current = anchorElement;
  }, [anchorElement]);

  useLayoutEffect(() => {
    if (!anchorElement || !selfRef.current) return;

    const calculateAndSetPosition = () => {
      if (!document.body.contains(anchorElement) || !selfRef.current) {
        setStyles(null);
        return;
      }

      const selfRect = selfRef.current.getBoundingClientRect();
      if (selfRect.width === 0 && selfRect.height === 0) {
        setStyles(null);
        return;
      }

      const anchorRect = anchorElement.getBoundingClientRect();

      const containingBlock = selfRef.current.offsetParent || document.documentElement;
      const containingBlockRect = containingBlock.getBoundingClientRect();
      const containingBlockStyle = window.getComputedStyle(containingBlock);
      const containingBlockBorderTopWidth = parseFloat(containingBlockStyle.borderTopWidth) || 0;
      const containingBlockBorderLeftWidth = parseFloat(containingBlockStyle.borderLeftWidth) || 0;

      const newTop =
        anchorRect.top +
        anchorRect.height / 2 -
        selfRect.height / 2 -
        (containingBlockRect.top + containingBlockBorderTopWidth);

      const paddingRight = 12;
      const newLeft =
        anchorRect.right - selfRect.width - paddingRight - (containingBlockRect.left + containingBlockBorderLeftWidth);

      setStyles({
        position: 'absolute',
        top: `${newTop}px`,
        left: `${newLeft}px`,
      });
    };

    calculateAndSetPosition();

    window.addEventListener('scroll', calculateAndSetPosition, true);
    window.addEventListener('resize', calculateAndSetPosition);

    const anchorObserver = new MutationObserver(() => {
      if (document.body.contains(anchorElement) && selfRef.current) {
        calculateAndSetPosition();
      } else {
        setStyles(null);
      }
    });

    if (anchorElement.parentElement) {
      anchorObserver.observe(anchorElement.parentElement, {
        childList: true,
        subtree: true,
      });
    }

    anchorObserver.observe(anchorElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      characterData: true,
      subtree: true,
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === selfRef.current) {
          calculateAndSetPosition();
        }
      }
    });

    resizeObserver.observe(selfRef.current);

    return () => {
      window.removeEventListener('scroll', calculateAndSetPosition, true);
      window.removeEventListener('resize', calculateAndSetPosition);
      anchorObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [anchorElement]);

  useEffect(() => {
    if (!anchorElement) {
      return;
    }

    const findAccountId = () => {
      for (const divElement of Array.from(anchorElement.querySelectorAll('div'))) {
        const accountId = divElement.textContent?.match(/\d{12}/)?.toString();
        if (accountId) {
          setAccountId(accountId);
          return true;
        }
      }

      return false;
    };

    if (findAccountId()) return;

    const observer = new MutationObserver(() => {
      if (findAccountId()) observer.disconnect();
    });

    observer.observe(anchorElement, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [anchorElement]);

  const accountMapping = accountMappings.find((m) => m.accountId == accountId);

  const finalStyles = (
    styles
      ? { ...styles, '--bg-colour': accountMapping?.backgroundColour, '--text-colour': accountMapping?.textColour }
      : { position: 'absolute', visibility: 'hidden' }
  ) as React.CSSProperties;

  return (
    <div
      ref={selfRef}
      className={`rounded-md py-1 px-2 font-semibold select-none pointer-events-none ${accountMapping ? 'bg-(--bg-colour) text-(--text-colour)' : 'bg-pink-500 text-black'}`}
      style={finalStyles}>
      {accountMapping?.name ?? 'NO MAPPING FOUND'}
    </div>
  );
};

export default StartAccount;
