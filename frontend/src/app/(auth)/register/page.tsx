import { Suspense } from 'react';
import { RegisterForm } from './RegisterForm';

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          <p className="text-neutral-600">Loading...</p>
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
