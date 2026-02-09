import { Request, Response } from 'express';
import * as showtimeService from '../services/showtime.service';

export const create = async (req: Request, res: Response) => {
  try {
    const showtime = await showtimeService.createShowtime(req.body);
    res.status(201).json({ success: true, data: showtime });
  } catch (error: any) {
    switch (error.message) {
      case 'INVALID_TIME_PAST':
        return res.status(400).json({ success: false, message: "Cannot schedule showtime in the past" });
      case 'MOVIE_NOT_FOUND':
        return res.status(404).json({ success: false, message: "Movie not found" });
      case 'ROOM_OCCUPIED':
        return res.status(409).json({ success: false, message: "Room is occupied during this time" });
      default:
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
};