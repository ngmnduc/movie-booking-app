import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@quickshow.com';
  const password = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
      fullName: 'Super Admin',
      role: Role.ADMIN,
      phone: '0999999999'
    },
  });

  console.log('Admin user seeded:', admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());