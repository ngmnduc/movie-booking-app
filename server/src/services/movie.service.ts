import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdminMovies = async (page: number, limit: number, search: string) => {
  const skip = (page - 1) * limit;
  
  const whereCondition = search ? {
    title: { contains: search, mode: 'insensitive' as const }
  } : {};

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { id: 'desc' }
    }),
    prisma.movie.count({ where: whereCondition })
  ]);

  return {
    data: movies,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};