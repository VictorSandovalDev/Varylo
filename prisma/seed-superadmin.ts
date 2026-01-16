import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString, ssl: true })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const email = 'vimasaba43@gmail.com'
    const password = 'Manuel123.'
    const name = 'Victor Sandoval'

    const passwordHash = await bcrypt.hash(password, 10)

    // Check if company exists for super admin or just create user without company?
    // Schema might require companyId? Let's check schema.
    // Actually, SUPER_ADMIN might not need a company, or might belong to a system company.
    // Let's create a generic "Admin Company" if needed, or null if optional.

    // Checking schema first would be prudent, but let's try assuming optional or create one.
    // Ideally Super Admin shouldn't need a companyId if the relation is optional. 
    // If strict RBAC, maybe they do.

    // Let's safe upsert.

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash,
            role: Role.SUPER_ADMIN,
        },
        create: {
            email,
            name,
            passwordHash,
            role: Role.SUPER_ADMIN,
            // companyId: ??? 
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
