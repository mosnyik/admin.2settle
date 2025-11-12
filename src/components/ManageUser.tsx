// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Eye, EyeOff, Lock } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// const ManageUser = () => {
//   const [showPin, setShowPin] = useState(false);
//   const [pinsMatch, setPinsMatch] = useState(true);
//   const [newPin, setNewPin] = useState("");
//   const [confirmPin, setConfirmPin] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const router = useRouter();

  

//   // modify pin change
//   const handlePinChange = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);
//     const storedPhone = localStorage.getItem("phone");
//     if (newPin !== confirmPin) {
//       setError("PINs do not match. Please try again.");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       if (storedPhone !== "") {
//         const response = await axios.post("/api/set_pin", {
//           phone: storedPhone,
//           pin: newPin,
//         });

//         if (response.status === 200) {
//           setNewPin("");
//           setConfirmPin("");
//           router.push("/transaction-dashboard");
//         }
//       }
//     } catch (err) {
//       if (axios.isAxiosError(err) && err.response) {
//         setError(
//           err.response.data.message || "Failed to set PIN. Please try again."
//         );
//       } else {
//         setError("An unexpected error occurred. Please try again.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // log user out
//   const handleLogout = () => {
//     localStorage.removeItem("phone");
//     localStorage.removeItem("userLoggedIn");
//     setIsLoggedIn(false);
//     router.push("/admin-login");
//   };

//   return (
//     <div className="space-x-2 space-y-2">
//       <Dialog>
//         <DialogTrigger asChild>
//           <Button variant="outline" size="sm" className="text-black">
//             Change PIN
//           </Button>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-md bg-white">
//           <DialogHeader>
//             <DialogTitle className="text-2xl font-bold text-center text-primary ">
//               Change PIN
//             </DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handlePinChange} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="newPin">New PIN</Label>
//               <div className="relative">
//                 <Lock
//                   className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
//                   size={18}
//                 />
//                 <Input
//                   id="newPin"
//                   type={showPin ? "text" : "password"}
//                   value={newPin}
//                   onChange={(e) => {
//                     setNewPin(e.target.value);
//                     setPinsMatch(e.target.value === confirmPin);
//                   }}
//                   className="pl-10 pr-10"
//                   required
//                   maxLength={6}
//                   pattern="\d{6}"
//                   title="Please enter a 6-digit PIN"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
//                   onClick={() => setShowPin(!showPin)}
//                 >
//                   {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
//                   <span className="sr-only">
//                     {showPin ? "Hide PIN" : "Show PIN"}
//                   </span>
//                 </Button>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="confirmPin">Confirm New PIN</Label>
//               <div className="relative">
//                 <Lock
//                   className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
//                   size={18}
//                 />
//                 <Input
//                   id="confirmPin"
//                   type={showPin ? "text" : "password"}
//                   value={confirmPin}
//                   onChange={(e) => {
//                     setConfirmPin(e.target.value);
//                     setPinsMatch(e.target.value === newPin);
//                   }}
//                   className="pl-10 pr-10"
//                   required
//                   maxLength={6}
//                   pattern="\d{6}"
//                   title="Please enter a 6-digit PIN"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
//                   onClick={() => setShowPin(!showPin)}
//                 >
//                   {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
//                   <span className="sr-only">
//                     {showPin ? "Hide PIN" : "Show PIN"}
//                   </span>
//                 </Button>
//               </div>
//             </div>
//             {confirmPin !== "" && !pinsMatch && (
//               <p className="text-red-500 text-sm mt-1">PINs do not match</p>
//             )}
//             {error && (
//               <Alert variant="destructive">
//                 <AlertTitle>Error</AlertTitle>
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}
//             <Button
//               type="submit"
//               className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out hover:bg-blue-700 disabled:opacity-50"
//               disabled={isLoading || !pinsMatch}
//             >
//               {isLoading ? "Changing PIN..." : "Change PIN"}
//             </Button>
//           </form>
//         </DialogContent>
//       </Dialog>
//       <Button variant="destructive" size="sm" onClick={handleLogout}>
//         Logout
//       </Button>
//     </div>
//   );
// };

// export default ManageUser;
