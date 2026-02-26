import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from './profile-form';

export default async function AgentProfilePage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Administra tu información personal y contraseña.
                </p>
            </div>

            <ProfileForm user={user} />
        </div>
    );
}
