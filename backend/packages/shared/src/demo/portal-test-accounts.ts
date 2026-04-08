/** Fixed portal demo logins for London dataset seed and the web login screen. */
export const DEMO_PORTAL_TEST_ACCOUNTS = {
  carrier: { email: 'testmail1@example.com', password: 'ZRqA8b_G!v7mt9A' },
  customer: { email: 'testmail2@example.com', password: '8-HKCskEfUQqy$P' },
  affiliate: { email: 'testmail3@example.com', password: '7CD5*fSD6PiKw!M' },
  ops: { email: 'testmail4@example.com', password: 'Demo8Ops!ViewAll99' },
} as const;

export type DemoPortalAccountKey = keyof typeof DEMO_PORTAL_TEST_ACCOUNTS;
