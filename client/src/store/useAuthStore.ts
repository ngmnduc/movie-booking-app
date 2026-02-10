import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Định nghĩa kiểu dữ liệu cho User
interface User {
  id?: string;
  email: string;
  role: string;
}

// 2. Định nghĩa kiểu cho Store
interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// 3. Tạo store với Type chuẩn
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);