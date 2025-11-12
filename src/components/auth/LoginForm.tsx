import React, { Dispatch, SetStateAction, useState } from "react";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Props {
  isSettingPin: boolean, 
  setIsSettingPin : Dispatch<SetStateAction<boolean>>
}

const LoginForm = ({ isSettingPin, setIsSettingPin }: Props) => {
  const router = useRouter();
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pinsMatch, setPinsMatch] = useState(true);
  const [phone, setPhone] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/admin_login", { phone, pin });

      if (isLoggedIn || response.status === 200) {
        if (response.data.requiresPinSet) {
          setIsSettingPin(true);
          setPin("");
          setConfirmPin("");
        } else {
          localStorage.setItem("phone", phone);
          localStorage.setItem("userLoggedIn", "true");
          setIsLoggedIn(true);
          console.log("We save phone as", phone);
          router.push("/transaction-dashboard");
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message || "Login failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (pin !== confirmPin) {
      setError("PINs do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/set_pin", { phone, pin });

      if (response.status === 200) {
        localStorage.setItem("phone", phone);
        localStorage.setItem("userLoggedIn", "true");
        setIsLoggedIn(true);
        router.push("/transaction-dashboard");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message || "Failed to set PIN. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={isSettingPin ? handleSetPin : handleSubmit}>
      <CardContent className="space-y-4">
        {!isSettingPin && (
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <Input
                id="phone"
                type="tel"
                placeholder="07012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="pin">{isSettingPin ? "New PIN" : "PIN"}</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={18}
            />
            <Input
              id="pin"
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (isSettingPin) {
                  setPinsMatch(e.target.value === confirmPin);
                }
              }}
              className="pl-10 pr-10"
              required
              maxLength={6}
              pattern="\d{6}"
              title="Please enter a 6-digit PIN"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              <span className="sr-only">
                {showPin ? "Hide PIN" : "Show PIN"}
              </span>
            </Button>
          </div>
        </div>
        {isSettingPin && (
          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm New PIN</Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <Input
                id="confirmPin"
                type={showPin ? "text" : "password"}
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  setPinsMatch(e.target.value === pin);
                }}
                className="pl-10 pr-10"
                required
                maxLength={6}
                pattern="\d{6}"
                title="Please enter a 6-digit PIN"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                <span className="sr-only">
                  {showPin ? "Hide PIN" : "Show PIN"}
                </span>
              </Button>
            </div>
            {isSettingPin && confirmPin !== "" && !pinsMatch && (
              <p className="text-red-500 text-sm mt-1">PINs do not match</p>
            )}
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading || (isSettingPin && !pinsMatch)}
        >
          {isLoading
            ? isSettingPin
              ? "Setting PIN..."
              : "Logging in..."
            : isSettingPin
            ? "Set PIN"
            : "Log in"}
        </Button>
      </CardFooter>
    </form>
  );
};

export default LoginForm;
