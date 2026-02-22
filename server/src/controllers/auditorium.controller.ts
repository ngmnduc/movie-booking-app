import { Request, Response } from 'express';
import * as auditoriumService from '../services/auditorium.service';

export const getAll = async (req: Request, res: Response) => {
  try {
    const rooms = await auditoriumService.getAllAuditoriums();
    return res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name, rowCount, columnCount } = req.body;

    if (!name || !rowCount || !columnCount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (rowCount < 1 || rowCount > 26) {
      return res.status(400).json({ success: false, message: 'Row count must be between 1 and 26' });
    }

    if (columnCount < 1 || columnCount > 50) {
      return res.status(400).json({ success: false, message: 'Column count must be between 1 and 50' });
    }

    const room = await auditoriumService.createAuditorium(name, Number(rowCount), Number(columnCount));
    return res.status(201).json({ success: true, data: room });

  } catch (error: any) {
    if (error.message === 'ROOM_NAME_EXISTS') {
      return res.status(409).json({ success: false, message: 'Auditorium name already exists' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updatedRoom = await auditoriumService.updateAuditoriumStatus(id, status);
    return res.status(200).json({ success: true, data: updatedRoom });

  } catch (error: any) {
    switch (error.message) {
      case 'ROOM_NOT_FOUND':
        return res.status(404).json({ success: false, message: 'Auditorium not found' });
      case 'HAS_UPCOMING_SHOWTIMES':
        return res.status(409).json({ success: false, message: 'Cannot set to maintenance. Room has upcoming showtimes.' });
      default:
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};