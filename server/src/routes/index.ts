import { Router } from 'express';
import authRoutes from './auth.routes';
import movieRoutes from './movie.routes';
import showtimeRoutes from './showtime.routes';

const router = Router();

router.use('/auth', authRoutes);         
router.use('/movies', movieRoutes);     
router.use('/showtimes', showtimeRoutes);

export default router;