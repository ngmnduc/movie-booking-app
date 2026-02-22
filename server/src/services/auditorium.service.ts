import { PrismaClient, SeatType } from '@prisma/client';

const prisma = new PrismaClient();
const DEFAULT_CINEMA_ID = 1; // Fix 1 rạp duy nhất

export const getAllAuditoriums = async () => {
  return await prisma.auditorium.findMany({
    include: {
      _count: {
        select: { seats: true } // Đếm tổng số ghế để FE hiển thị
      }
    },
    orderBy: { id: 'asc' }
  });
};

export const createAuditorium = async (name: string, rowCount: number, columnCount: number) => {
  // Check trùng tên 
  const existingRoom = await prisma.auditorium.findFirst({
    where: { name }
  });

  if (existingRoom) {
    throw new Error('ROOM_NAME_EXISTS');
  }

  const seatsData = [];
  for (let r = 0; r < rowCount; r++) {
    const rowLabel = String.fromCharCode(65 + r); 
    for (let c = 1; c <= columnCount; c++) {
      seatsData.push({
        row: rowLabel,
        number: c,
        type: SeatType.NORMAL 
      });
    }
  }


  return await prisma.auditorium.create({
    data: {
      name,
      theaterId: 1,
      seats: {
        create: seatsData
      }
    }
  });
};

export const updateAuditoriumStatus = async (id: number, status: string) => {
  const room = await prisma.auditorium.findUnique({ where: { id } });
  if (!room) {
    throw new Error('ROOM_NOT_FOUND');
  }

  if (status === 'MAINTENANCE') {
    const now = new Date();
    const upcomingShowtime = await prisma.showtime.findFirst({
      where: {
        auditoriumId: id,
        startTime: { gte: now }
      }
    });

    if (upcomingShowtime) {
      throw new Error('HAS_UPCOMING_SHOWTIMES');
    }
  }

  return await prisma.auditorium.update({
    where: { id },
    data: { status }
  });
};