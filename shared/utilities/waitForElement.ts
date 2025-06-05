export const waitForElement = (selectors: string, timeout = 10_000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const initialElement = document.querySelector(selectors);
    if (initialElement) {
      resolve(initialElement);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver((_mutations, obs) => {
      const element = document.querySelector(selectors);
      if (element) {
        clearTimeout(timer);
        obs.disconnect();

        resolve(element);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    timer = setTimeout(() => {
      observer.disconnect();

      reject(new Error(`Element "${selectors}" not found within timeout of ${timeout}ms`));
    }, timeout);
  });
};
