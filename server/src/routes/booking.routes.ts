import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { verifyToken } from '../middlewares/auth.middleware'; // Bắt buộc đăng nhập

const router = Router();

router.post('/hold-seat', verifyToken, bookingController.holdSeat);
router.delete('/release-seat', verifyToken, bookingController.releaseSeat);

export default router;