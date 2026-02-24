import { Request,Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import * as tmdbService from '../services/tmdb.service';
import { getOrSetCache } from '../config/redis';
import { success } from "zod";
import * as movieService from '../services/movie.service';
const prisma = new PrismaClient();

export const searchTmdb = async(req: Request, res:Response) => {
    try{
        const query = req.query.query as string;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;

        if(!query){
            return res.status(400).json({ message: "Missing query param" });
        }
        const cacheKey = `tmdb_search:${query.toLowerCase()}:${page}`;
        const data = await getOrSetCache(cacheKey,600,async() => {
            return await tmdbService.searchMovies(query,page);
        });
        res.json({success: true,data});
    }
    catch(error){
        res.status(500).json({success: false, message:'Search failed'});
    }
};

export const createFromTmdb = async (req: Request, res: Response) => {
  try {
    const { tmdbId } = req.body;
    if (!tmdbId) return res.status(400).json({ message: "Missing tmdbId" });

    const existing = await prisma.movie.findUnique({ where: { tmdbId } });
    if (existing) {
      return res.status(409).json({ message: "Movie already exists in database" });
    }
    const movieData = await tmdbService.getMovieDetails(tmdbId);

    const newMovie = await prisma.movie.create({
      data: {
        tmdbId: movieData.tmdbId,
        title: movieData.title,
        originalTitle: movieData.originalTitle,
        description: movieData.description,
        posterPath: movieData.posterPath,
        backdropPath: movieData.backdropPath,
        duration: movieData.duration,
        rating: movieData.rating,
        releaseDate: new Date(movieData.releaseDate),
        genres: movieData.genres, 
        cast: movieData.cast,     
        status: 'NOW_SHOWING'   
      }
    });

    res.status(201).json({ success: true, data: newMovie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Import failed" });
  }
};
// [GET] /api/movies
export const getLocalMovies = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where = status ? { status: String(status) } : {};

    const movies = await prisma.movie.findMany({
      where,
      orderBy: { releaseDate: 'desc' }
    });

    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

export const getAdminMovies = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const search = req.query.search ? String(req.query.search) : '';

    const result = await movieService.getAdminMovies(page, limit, search);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPublicMovieDetail = async(req: Request, res: Response) =>{
  try{
    const id = Number(req.params.id);
    const movie = await movieService.getPublicMovieDetail(id);
    return res.status(200).json({ success: true, data: movie });

  }catch(error:any){
    if (error.message === 'MOVIE_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });

  }
};