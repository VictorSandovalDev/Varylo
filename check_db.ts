
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log("Connecting...");
    try {
        // Using queryRaw to check columns in the Message table (Postgres)
        const result = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Message'
     `;
        console.log("Columns in Message table:", result);
    } catch (e) {
        console.error("Connection error or query failed:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
