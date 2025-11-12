export default function truncateString(str: string, num?: number): string {
  if (typeof str !== "string") throw new Error("Enter a string value");
  if (str.length <= 4) return str;
  if (str.length > 4) {
    if (!num) num = 4;
    return str.slice(0, num) + "...";
  }
  return "";
}
