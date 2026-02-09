import { Router } from 'express';
import * as showtimeController from '../controllers/showtime.controller';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, requireAdmin, showtimeController.create);

export default router;