import { Router } from 'express';
import * as auditoriumController from '../controllers/auditorium.controller';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// admin lấy danh sách phòng để xếp lịch
router.get('/', verifyToken, requireAdmin, auditoriumController.getAll);

//  tạo phòng
router.post('/', verifyToken, requireAdmin, auditoriumController.create);

// cập nhật trạng thái phòng
router.put('/:id', verifyToken, requireAdmin, auditoriumController.updateStatus);

export default router;