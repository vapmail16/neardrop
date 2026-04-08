import { redirect } from 'next/navigation';

export default function AffiliateRegisterPage() {
  redirect('/register?role=affiliate');
}
