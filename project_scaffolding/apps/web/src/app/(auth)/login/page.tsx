import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          <p className="text-neutral-600">Loading...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
