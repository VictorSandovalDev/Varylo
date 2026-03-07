import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import { getContact } from './actions';
import { ContactDetailClient } from './contact-detail-client';

export default async function ContactDetailPage(props: {
    params: Promise<{ lang: string; id: string }>;
}) {
    const params = await props.params;
    const session = await auth();
    if (!session) return null;

    const contact = await getContact(params.id);
    if (!contact) return notFound();

    return <ContactDetailClient contact={contact as any} lang={params.lang} />;
}
