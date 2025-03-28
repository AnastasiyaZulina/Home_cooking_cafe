import { prisma } from '@/prisma/prisma-client';
import { ProfileLayout } from '@/shared/components/shared/profile-layout';
import { getUserSession } from '@/shared/lib/get-user-session';
import { redirect } from 'next/navigation';

export default async function ProfileDataPage() {
  const session = await getUserSession();

  if (!session) {
    redirect('/not-auth');
  }

  const user = await prisma.user.findFirst({
    where: {
      id: Number(session?.id),
    },
  });

  if (!user) {
    redirect('/not-auth');
  }

  // Возвращаем React-компонент
  return <ProfileLayout user={user} />;
}