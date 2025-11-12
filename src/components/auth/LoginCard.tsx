import { useState } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "./LoginForm";

const LoginCard = () => {
  const [isSettingPin, setIsSettingPin] = useState(false);

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl relative z-10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-primary">
          {isSettingPin ? "Set Your PIN" : "Admin Login"}
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          {isSettingPin
            ? "Create a new 6-digit PIN for your account"
            : "Enter your phone number and PIN to access the transaction dashboard"}
        </CardDescription>
      </CardHeader>
      <LoginForm
        isSettingPin={isSettingPin}
        setIsSettingPin={setIsSettingPin}
      />
    </Card>
  );
};

export default LoginCard;
