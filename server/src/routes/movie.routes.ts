import * as movieController from '../controllers/movie.controller';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware';
import { Router } from "express";

const router = Router()

router.get('/', movieController.getLocalMovies);
// search phim trên tmdb cho adm
router.get('/tmdb/search', verifyToken, requireAdmin, movieController.searchTmdb);
// import phim
router.post('/', verifyToken, requireAdmin, movieController.createFromTmdb);
router.get('/admin', verifyToken, requireAdmin, movieController.getAdminMovies);

router.get('/:id/public', movieController.getPublicMovieDetail);
export default router;
