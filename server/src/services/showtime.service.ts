import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CLEANING_BUFFER_MINUTES = 30;
const PRICE_MORNING = 100000; // Trước 17h
const PRICE_EVENING = 130000; // Sau 17h

export const createShowtime = async (data: any) => {
  const { movieId, auditoriumId, startTime } = data;

  const start = new Date(startTime);
  const now = new Date();

  if (start < now) {
    throw new Error('INVALID_TIME_PAST');
  }

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    select: { duration: true }
  });

  if (!movie) {
    throw new Error('MOVIE_NOT_FOUND');
  }

  // Calculate End Time 
  const totalDurationMinutes = movie.duration + CLEANING_BUFFER_MINUTES;
  const end = new Date(start.getTime() + totalDurationMinutes * 60000);

  // Check Overlap
  const conflict = await prisma.showtime.findFirst({
    where: {
      auditoriumId,
      AND: [
        { startTime: { lt: end } },
        { endTime: { gt: start } }
      ]
    }
  });

  if (conflict) {
    throw new Error('ROOM_OCCUPIED');
  }

  // Auto Price Logic
  const hour = start.getHours();
  const basePrice = hour < 17 ? PRICE_MORNING : PRICE_EVENING;

  return await prisma.showtime.create({
    data: {
      movieId,
      auditoriumId,
      startTime: start,
      endTime: end,
      basePrice
    },
    include: {
      movie: { select: { title: true, duration: true } },
      auditorium: { select: { name: true } }
    }
  });
};

export const getShowtimesByMovie = async (movieId: number) => {
  return await prisma.showtime.findMany({
    where: { movieId: Number(movieId) },
    include: { auditorium: true },
    orderBy: { startTime: 'asc' }
  });
};

export const getAdminShowtimes = async (dateString: string) => {
  // Lấy từ 00:00:00 đến 23:59:59 của ngày đó
  const startOfDay = new Date(dateString);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(dateString);
  endOfDay.setHours(23, 59, 59, 999);

  return await prisma.showtime.findMany({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      movie: { select: { title: true, duration: true } },
      auditorium: { select: { name: true } },
      _count: { select: { bookings: true } } // Đếm số đơn đặt vé để UI biết suất này có khách ko
    },
    orderBy: { startTime: 'asc' }
  });
};

export const deleteShowtime = async (id: number) => {
  const showtime = await prisma.showtime.findUnique({
    where: { id },
    include: {
      _count: { select: { bookings: true } }
    }
  });

  if (!showtime) {
    throw new Error('SHOWTIME_NOT_FOUND');
  }

  if (showtime._count.bookings > 0) {
    throw new Error('HAS_BOOKINGS');
  }

  return await prisma.showtime.delete({
    where: { id }
  });
};