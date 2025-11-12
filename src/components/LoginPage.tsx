"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "./auth/LoginCard";

export default function AdminLoginPage() {
  const [phone, setPhone] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    // Check if user is already logged in
    const storedPhone = localStorage.getItem("phone");
    const storedLoginStatus = localStorage.getItem("userLoggedIn");

    if (storedPhone && storedLoginStatus === "true") {
      setPhone(storedPhone);
      setIsLoggedIn(true);
      router.push("/transaction-dashboard");
    }

    return () => window.removeEventListener("resize", checkIfMobile);
  }, [router]);

  console.log("Phone:", phone);
  console.log("isLoggedIn:", isLoggedIn);
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: isMobile
          ? "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/phone%20view%20(1)-mbdcjiIL33wTRN3gU2ofv4X5TvNRwj.jpg')"
          : "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/web%20-1XgYy034lmuEoXLhu8DaZ8Twy3EOxg.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <LoginCard />
    </div>
  );
}
