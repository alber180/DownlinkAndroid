import './instagram-extractor.mjs';
import { chromium } from 'playwright-core';

let sequence = 0;
// No browser is launched and no network calls or existing profiles are used.
chromium.launch = async () => {
  const account = `fixture-account-${++sequence}`;
  let connected = true;
  return {
    isConnected: () => connected,
    close: async () => { connected = false; },
    newContext: async () => ({
      newPage: async () => ({ goto: async () => {} }),
      cookies: async () => [{ domain: '.instagram.com', name: 'sessionid', value: account,
        path: '/', expires: Date.now() / 1000 + 3600, secure: true, httpOnly: true }],
    }),
  };
};
