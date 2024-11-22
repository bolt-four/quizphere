import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  adminId: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      adminId: null,
      userId: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await fetch('http://localhost:8001/user/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to login');
          }

          const data = await response.json();
          set({
            accessToken: data.access_token,
            adminId: data.adminId,
            userId: data.userId,
            isAuthenticated: true,
          });
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        set({
          accessToken: null,
          adminId: null,
          userId: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);