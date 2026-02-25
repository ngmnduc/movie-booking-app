import { Router } from 'express';
import * as showtimeController from '../controllers/showtime.controller';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, requireAdmin, showtimeController.create);
router.get('/admin', verifyToken, requireAdmin, showtimeController.getAdminShowtimes);
router.delete('/:id', verifyToken, requireAdmin, showtimeController.deleteShowtime);

router.get('/public', showtimeController.getPublicShowtimes);
router.get('/:id/seats', showtimeController.getSeatMap);
export default router;