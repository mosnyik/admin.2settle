import { create } from "zustand";
import { persist } from "zustand/middleware";
export type User = {
  phone: string;
  pin: string;
};
interface AuthStore {
  user: User | null;
  loginTime: number | null;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  checkSession: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loginTime: null,
      loginUser: (user) => set({ user }),
      logoutUser: () => set({ user: null }),
      checkSession: () => {
        const { loginTime, logoutUser } = get();

        if (!loginTime) return;

        const now = Date.now();
        const diffInHours = (now - loginTime) / (1000 * 60 * 60);

        if (diffInHours >= 24) {
          console.log("Session expired. Logout user");
          logoutUser();
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
