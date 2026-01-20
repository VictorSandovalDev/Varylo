import { PrismaClient, ChannelType, ChannelStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Instagram Channel...");

    // Find a company (mocking the context)
    const company = await prisma.company.findFirst({
        include: { users: true }
    });

    if (!company) {
        console.error("No company found. Please run the main seed script first.");
        process.exit(1);
    }

    console.log(`Found company: ${company.name}`);

    const pageId = "100012345678901"; // Matches simulation script default if I set it there, or I'll copy this ID.
    const verifyToken = "varylo_instagram_verify"; // Matches simulation if I updated it, but I didn't enforce it in the script yet.

    // Upsert Channel
    const channel = await prisma.channel.create({
        data: {
            companyId: company.id,
            type: ChannelType.INSTAGRAM,
            status: ChannelStatus.CONNECTED,
            configJson: {
                pageId: pageId,
                accessToken: "mock_access_token",
                verifyToken: verifyToken,
                instagramId: "ig_12345"
            }
        }
    });

    console.log("Created Instagram Channel:", channel);
    console.log("Use Page ID for webhook simulation:", pageId);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
