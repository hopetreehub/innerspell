import { redirect } from 'next/navigation';

export async function GET() {
  redirect('/sign-up');
}