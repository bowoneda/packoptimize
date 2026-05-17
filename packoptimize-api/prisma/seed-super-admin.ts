import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL ?? 'admin@swiftship.com';

  const updated = await prisma.user.updateMany({
    where: { email },
    data: { isSuperAdmin: true },
  });

  if (updated.count === 0) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`Promoted ${email} to super admin (${updated.count} record updated).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
