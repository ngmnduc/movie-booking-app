import bcrypt from 'bcryptjs';

export const hashedPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password,salt)
};

export const comparePassword = async (rawPassword: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(rawPassword, hash);
};