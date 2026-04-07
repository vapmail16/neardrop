/**
 * Contract: native HTML form default is GET; without synchronous preventDefault + POST method,
 * failed React hydration can submit with ?email=&password= on the URL (security + confusing 404-ish UX).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('LoginForm.tsx submit contract', () => {
  it('uses method post and synchronous preventDefault before async sign-in', () => {
    const raw = readFileSync(
      path.join(process.cwd(), 'src/app/(auth)/login/LoginForm.tsx'),
      'utf8',
    );
    expect(raw).toMatch(/method=\{?["']post["']\}?/);
    expect(raw).toMatch(/onSubmit=\{\(e\)\s*=>\s*\{/);
    expect(raw).toMatch(/e\.preventDefault\(\)/);
    expect(raw).toMatch(/void submitSignIn\(\)/);
    expect(raw).not.toMatch(/onSubmit=\{\(e\)\s*=>\s*void onSubmit\(e\)\}/);
  });
});
