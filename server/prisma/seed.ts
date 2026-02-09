import { PrismaClient, Role, SeatType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const generateSeats = (rows: number, cols: number) => {
  const seats = [];
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      seats.push({
        row: rowLabels[r],
        number: c,
        type: c > 4 ? SeatType.VIP : SeatType.NORMAL
      });
    }
  }
  return seats;
};

async function main() {
  // Seed admin user
  const adminEmail = 'admin@quickshow.com';
  const adminPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminPassword,
      fullName: 'Super Admin',
      role: Role.ADMIN,
      phone: '0999999999',
    },
  });
  console.log('Admin seeded');

  // Seed theater with auditoriums and seats
  await prisma.theater.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'CGV Vincom Ba Trieu',
      location: '191 Ba Trieu, Hai Ba Trung, Ha Noi',
      auditoriums: {
        create: [
          {
            name: 'Room 1 (Standard)',
            seats: { create: generateSeats(5, 8) }
          },
          {
            name: 'Room 2 (IMAX)',
            seats: { create: generateSeats(6, 10) }
          },
          {
            name: 'Room 3 (Gold Class)',
            seats: { create: generateSeats(3, 6) }
          }
        ]
      }
    }
  });
  console.log('Theater & auditoriums seeded');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });