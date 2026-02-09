import { PrismaClient, Role } from '@prisma/client';
import { hashedPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { email } from 'zod';
//import { ApiError } from '../utils/api-error';

const prisma = new PrismaClient();

export const registerUser = async (data: any) => {
    const {email, password, fullName, phone } = data;

    const existingUser = await prisma.user.findUnique({where: email});
    if (existingUser){
        throw new Error("EMAIL_EXISTS")
    }
    const passwordHash = await hashedPassword(password);
    const newUser = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      fullName,
      phone,
      role: Role.CUSTOMER, 
    },
    select: { 
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true
    }
  });
  return newUser;
};

export const loginUser = async(email: string, password: string) => {
  const user = await prisma.user.findUnique({where: { email }});

  if (!user){
    throw new Error('INVALID_CREDENTIALS');
  }

  const isMatch = await comparePassword(password, user.password)
  if(!isMatch){
    throw new Error('INVALID_CREDENTIALS');
  }
  const token = signToken({
    sub: user.id,
    role: user.role, 
    email: user.email
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  };
};