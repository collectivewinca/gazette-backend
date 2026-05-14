import { getMember } from '@/lib/queries';
import { notFound } from 'next/navigation';
import { EditProfileForm } from './edit-form';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const member = await getMember(params.id);
  if (!member) return { title: 'Not Found' };
  return { title: `Edit ${member.name} — The Class Gazette` };
}

export default async function EditProfilePage({ params }: Props) {
  const member = await getMember(params.id);
  if (!member) notFound();

  return <EditProfileForm member={member} />;
}
