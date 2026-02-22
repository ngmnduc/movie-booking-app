import { Router } from 'express';
import * as showtimeController from '../controllers/showtime.controller';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, requireAdmin, showtimeController.create);
router.get('/admin', verifyToken, requireAdmin, showtimeController.getAdminShowtimes);
router.delete('/:id', verifyToken, requireAdmin, showtimeController.deleteShowtime);

export default router;