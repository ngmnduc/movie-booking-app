import { Request, Response } from "express";
import * as authService from '../services/auth.service';
import mongoose from "mongoose";

export const register = async (req: Request, res: Response) => {
    //const session = await mongoose.startSession()
    try {
        const {email,password,fullName,phone} = req.body;
        if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await authService.registerUser({ email, password, fullName, phone });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });
    }
    catch (error: any) {
        if (error.message ==="EMAIL_EXISTS"){
            return res.status(409).json({success: false, message: "Email already exists"});
        }
        console.error(error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });    }

};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const result = await authService.loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });

  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: (req as any).user 
  });
};