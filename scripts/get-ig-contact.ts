
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env explicit
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    console.log('--- FETCHING LATEST INSTAGRAM USER ID ---');
    console.log('DB URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');

    try {
        const contact = await prisma.contact.findFirst({
            where: { companyName: 'Instagram' }, // O ajusta segun como guardaste el nombre
            orderBy: { updatedAt: 'desc' }
        });

        if (!contact) {
            // Intenta buscar el ultimo mensaje INBOUND
            const msg = await prisma.message.findFirst({
                where: { direction: 'INBOUND', company: { channels: { some: { type: 'INSTAGRAM' } } } },
                orderBy: { createdAt: 'desc' }
            });
            if (msg) {
                console.log(`FOUND ID FROM MESSAGE: ${msg.from}`);
                return;
            }
            console.log('No Instagram contacts or messages found.');
        } else {
            console.log(`FOUND ID FROM CONTACT: ${contact.phone}`);
            console.log(`Contact Name: ${contact.name}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
