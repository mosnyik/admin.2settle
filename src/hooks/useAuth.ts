import { User } from "@/stores.ts/authStore";
import axios from "axios";

const useAuth = () => {
  const login = async (user: User) => {
    const { phone, pin } = user;
    return await axios.post("/api/admin_login", { phone, pin });
  };

  const logout = () => {};
  const changePin = () => {};

  return {
    login,
    logout,
    changePin,
  };
};

export default useAuth;
