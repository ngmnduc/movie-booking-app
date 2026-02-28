import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';
import { Socket } from 'socket.io';

const ERROR_MESSAGES = {
  SEAT_ALREADY_SOLD: 'Seat has already been sold',
  SEAT_ALREADY_LOCKED: 'This seat has been selected by another user',
  NOT_YOUR_LOCK: 'You do not have permission to release this seat',
  INTERNAL_ERROR: 'An internal server error occurred'
};

export const holdSeat = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        
        const { showtimeId, seatId } = req.body;
        const result = await bookingService.holdSeat(userId, Number(showtimeId), Number(seatId));
        const io = req.app.get('io');
        
        if (io) {
            io.to(`showtime_${showtimeId}`).emit('seat_locked', { seatId });
        }
        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        if (error.message === 'SEAT_ALREADY_SOLD') {
            return res.status(409).json({ success: false, message: ERROR_MESSAGES.SEAT_ALREADY_SOLD });
        }
        if (error.message === 'SEAT_ALREADY_LOCKED') {
            return res.status(409).json({ success: false, message: ERROR_MESSAGES.SEAT_ALREADY_LOCKED });
        }
        console.error(error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR });
    }
};

export const releaseSeat = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const { showtimeId, seatId } = req.body;
    const result = await bookingService.releaseSeat(userId, Number(showtimeId), Number(seatId));
    const io = req.app.get('io');
    
    if (io && result) {
      io.to(`showtime_${showtimeId}`).emit('seat_released', { seatId });
    }
    return res.status(200).json({ success: true, message: 'Seat released successfully' });
  } catch (error: any) {
    if (error.message === 'NOT_YOUR_LOCK') {
      return res.status(403).json({ success: false, message: ERROR_MESSAGES.NOT_YOUR_LOCK });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};