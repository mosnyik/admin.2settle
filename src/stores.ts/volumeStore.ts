// import { create } from "zustand";
// import axios from "axios";

// interface VolumeStore {
//   data: any;
//   isLoading: boolean;
//   error: string | null;
//   fetchAllData: () => Promise<void>;
// }

// const useVolumeStore = create<VolumeStore>((set) => ({
//   data: null,
//   isLoading: false,
//   error: null,

//   fetchAllData: async () => {
//     set({ isLoading: true, error: null });

//     try {
//       // Fetch both APIs in parallel
//       const resMain = await axios
//         .get("/api/total_volume_tyd")
//         .then((res) => res.data);
//       const resYtdGoogle = await axios
//         .get("/api/get_YTD_google")
//         .then((res) => res.data);
//       //   .then((res) => res.data);
//       // const [resMain, resYtdGoogle] = await Promise.all([
//       //   axios.get("/api/total_volume_tyd"),
//       //   axios.get("/api/get_YTD_google"),
//       // ]);

//       // Parse the Google YTD value
//       const ytdGoogleString = resYtdGoogle.data;
//       console.log("String", ytdGoogleString);
//       const ytdGoogleNumber = parseFloat(ytdGoogleString.replace(/[$,]/g, ""));

//       // Get the YTD value from the main API
//       const ytdFromMain = resMain.data.YTDnaira || 0;

//       // Combine both
//       const combinedYtd = ytdFromMain + ytdGoogleNumber;

//       // Merge back into the response
//       const mergedData = {
//         ...resMain.data,
//         YTDnaira: combinedYtd,
//         YTDdollar: combinedYtd,
//       };

//       set({ data: mergedData });
//     } catch (err: any) {
//       console.error("Error fetching data:", err);
//       set({ error: err.message });
//     } finally {
//       set({ isLoading: false });
//     }
//   },
// }));

// export default useVolumeStore;
