import { PrismaClient, Role, Plan, ChannelType, ChannelStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 1. Create Super Admin
  // Note: In production use hashed passwords. Using plaintext "password123" for MVP simplicity or mock hash.
  const passwordHash = "$2b$10$e.g.hashedpassword" 

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@varylo.com' },
    update: {},
    create: {
      email: 'superadmin@varylo.com',
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      passwordHash, 
    },
  })
  console.log('Created Super Admin:', superAdmin.email)

  // 2. Create Demo Company
  const demoCompany = await prisma.company.upsert({
    where: { id: 'demo-company-id' }, // constant ID for predictability
    update: {},
    create: {
      id: 'demo-company-id',
      name: 'Acme Corp',
      plan: Plan.PRO,
      status: 'ACTIVE',
    },
  })
  console.log('Created Company:', demoCompany.name)

  // 3. Create Company Admin
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      name: 'Alice Admin',
      role: Role.COMPANY_ADMIN,
      companyId: demoCompany.id,
      passwordHash,
    },
  })
  console.log('Created Company Admin:', companyAdmin.email)

  // 4. Create Agents
  const agent1 = await prisma.user.upsert({
    where: { email: 'agent1@acme.com' },
    update: {},
    create: {
      email: 'agent1@acme.com',
      name: 'Bob Agent',
      role: Role.AGENT,
      companyId: demoCompany.id,
      passwordHash,
    },
  })
  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@acme.com' },
    update: {},
    create: {
      email: 'agent2@acme.com',
      name: 'Charlie Agent',
      role: Role.AGENT,
      companyId: demoCompany.id,
      passwordHash,
    },
  })
  console.log('Created Agents:', agent1.email, agent2.email)

  // 5. Create Channel (WhatsApp)
  const channel = await prisma.channel.create({
    data: {
      companyId: demoCompany.id,
      type: ChannelType.WHATSAPP,
      status: ChannelStatus.CONNECTED,
      configJson: { phoneNumberId: '123456789' },
    },
  })
  console.log('Created Channel:', channel.type)
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
