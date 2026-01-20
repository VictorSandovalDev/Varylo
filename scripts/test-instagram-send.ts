import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log('--- Testing Instagram Send ---');

    // 1. Get Channel
    const channel = await prisma.channel.findFirst({
        where: { type: 'INSTAGRAM' }
    });

    if (!channel || !channel.configJson) {
        console.error('No Instagram channel found in DB.');
        return;
    }

    const config = channel.configJson as any;
    const pageId = config.pageId;
    const accessToken = config.accessToken;

    console.log(`Found Channel. Page ID: ${pageId}`);
    console.log(`Access Token: ${accessToken ? 'Yes (Hidden)' : 'No'}`);

    if (!pageId || !accessToken) {
        console.error('Missing credentials.');
        return;
    }

    // 2. Get a recent contact/conversation to reply to
    // We need a valid Recipient ID (IGSID)
    console.log('Fetching most recent conversation...');
    const conversation = await prisma.conversation.findFirst({
        where: { channelId: channel.id },
        include: { contact: true },
        orderBy: { updatedAt: 'desc' }
    });

    if (!conversation) {
        console.error('No conversation found to reply to. Send a message to the bot first.');
        return;
    }

    const recipientId = conversation.contact.phone; // We stored IGSID in phone field
    console.log(`Attempting to send to Recipient (IGSID): ${recipientId}`);

    // 3. Send
    console.log('Sending "Test from script"...');

    // We import the function manually or replicate logic to verify
    // Replicating logic here to be 100% sure of what's running
    try {
        const endpointId = pageId;
        const url = `https://graph.facebook.com/v18.0/${endpointId}/messages`;
        console.log(`POST ${url}`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text: "Test from script 123" }
            })
        });

        const data = await response.json();
        console.log('--- API RESPONSE ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('--------------------');

    } catch (e) {
        console.error('Fetch error:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
