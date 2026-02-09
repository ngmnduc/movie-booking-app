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