import { Suspense } from 'react';
import { CustomerRegisterForm } from './CustomerRegisterForm';

export default function CustomerRegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          <p className="text-neutral-600">Loading...</p>
        </main>
      }
    >
      <CustomerRegisterForm />
    </Suspense>
  );
}
