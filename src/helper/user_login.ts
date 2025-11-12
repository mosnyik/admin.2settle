export function parseSupportNumber(supportId: string) {
  // Check if the input is a string
  if (typeof supportId !== "string") {
    throw new Error("Input must be a string");
  }

  // Remove the 'SUPPORT' prefix if it exists
  const numericPart = supportId.replace(/^SUPPORT/, "");

  // Check if the remaining part is a valid number
  if (!/^\d+$/.test(numericPart)) {
    throw new Error("Invalid support number format");
  }

  return numericPart;
}

export const formatPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber.startsWith("0")) {
    return "+234" + phoneNumber.slice(1);
  }
  return phoneNumber;
};
