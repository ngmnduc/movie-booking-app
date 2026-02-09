import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret_mac_dinh';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (payload: object) => {
  return jwt.sign(payload, SECRET as jwt.Secret, { 
    expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'] 
  });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, SECRET);
};