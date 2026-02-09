import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = header.split(' ')[1];
    const decoded: any = verifyJwt(token);

    // Kiểm tra user còn tồn tại trong DB không 
    const user = await prisma.user.findUnique({ 
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true, fullName: true } 
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user; // Gán user vào request
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Middleware chặn Admin
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: "Access denied: Admins only" });
  }
  next();
};