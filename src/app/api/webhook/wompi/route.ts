import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { addCredits } from '@/lib/credits';
import { CreditTransactionType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const event = body.event;
        const data = body.data;
        const signature = body.signature;
        const timestamp = body.timestamp;

        if (event !== 'transaction.updated') {
            return NextResponse.json({ status: 'ignored' });
        }

        // Validate signature
        const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
        if (!eventsSecret) {
            console.error('[Wompi] WOMPI_EVENTS_SECRET not configured');
            return NextResponse.json({ error: 'Not configured' }, { status: 500 });
        }

        const transaction = data?.transaction;
        if (!transaction) {
            return NextResponse.json({ status: 'ignored' });
        }

        // Wompi signature: SHA256 of concatenated properties + timestamp + events_secret
        const signatureString = `${transaction.id}${transaction.status}${transaction.amount_in_cents}${timestamp}${eventsSecret}`;
        const expectedSignature = createHash('sha256').update(signatureString).digest('hex');

        if (signature?.checksum !== expectedSignature) {
            console.error('[Wompi] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Only process APPROVED transactions
        if (transaction.status !== 'APPROVED') {
            return NextResponse.json({ status: 'not_approved' });
        }

        // Extract companyId from reference: "varylo-{companyId}-{timestamp}"
        const reference = transaction.reference as string;
        if (!reference?.startsWith('varylo-')) {
            console.error('[Wompi] Invalid reference format:', reference);
            return NextResponse.json({ error: 'Invalid reference' }, { status: 400 });
        }

        const parts = reference.split('-');
        // Reference format: varylo-{companyId}-{timestamp}
        // companyId is a cuid which may contain hyphens, so we take everything between first and last hyphen-segment
        const companyId = parts.slice(1, -1).join('-');

        if (!companyId) {
            console.error('[Wompi] Could not extract companyId from reference:', reference);
            return NextResponse.json({ error: 'Invalid reference' }, { status: 400 });
        }

        // Verify company exists
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true },
        });

        if (!company) {
            console.error('[Wompi] Company not found:', companyId);
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        // amount_in_cents → COP (divide by 100)
        const amountCop = Math.round(transaction.amount_in_cents / 100);

        const result = await addCredits({
            companyId,
            amount: amountCop,
            type: CreditTransactionType.RECHARGE,
            description: `Recarga Wompi - ${amountCop.toLocaleString('es-CO')} COP`,
            referenceId: transaction.id,
        });

        console.log(`[Wompi] Credits added for company ${companyId}: +${amountCop} COP, new balance: ${result.newBalance}`);

        return NextResponse.json({ status: 'success', newBalance: result.newBalance });
    } catch (error) {
        console.error('[Wompi] Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
