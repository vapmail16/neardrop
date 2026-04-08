import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEMO_PORTAL_TEST_ACCOUNTS } from '@neardrop/shared';

describe('LoginForm demo portal contract', () => {
  it('imports the same ops email/password as the shared package source (avoids UI/seed drift)', () => {
    const sharedSrc = readFileSync(
      path.join(process.cwd(), 'packages/shared/src/demo/portal-test-accounts.ts'),
      'utf8',
    );
    expect(sharedSrc).toContain(`'${DEMO_PORTAL_TEST_ACCOUNTS.ops.email}'`);
    expect(sharedSrc).toContain(`'${DEMO_PORTAL_TEST_ACCOUNTS.ops.password}'`);
  });
});
