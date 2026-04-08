import { redirect } from 'next/navigation';

export default function CustomerRegisterPage() {
  redirect('/register?role=customer');
}
