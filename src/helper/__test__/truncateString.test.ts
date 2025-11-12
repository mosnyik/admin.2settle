import { describe, it, expect } from "vitest";
import trunctateString from "../trunctate_string";

describe("truncateString", () => {
  it("should throw error for non string inputs", () => {
    expect(() => trunctateString(123 as unknown as string)).toThrow(
      "Enter a string value"
    );
    expect(() => trunctateString(null as unknown as string)).toThrow(
      "Enter a string value"
    );
    expect(() => trunctateString(undefined as unknown as string)).toThrow(
      "Enter a string value"
    );
  });
  it("should return the same string if length is less than or equal to 4", () => {
    expect(trunctateString("test")).toBe("test");
    expect(trunctateString("hello")).toBe("hell...");
    expect(trunctateString("")).toBe("");
  });
  it("should truncate the string and add ellipsis if length is greater than 5", () => {
    expect(trunctateString("truncate", 5)).toBe("trunc...");
    expect(trunctateString("abcdefghij", 3)).toBe("abc...");
    expect(trunctateString("longstring", 4)).toBe("long...");
  });
  it("should default to truncating to 4 characters if num is not provided", () => {
    expect(trunctateString("truncate")).toBe("trun...");
    expect(trunctateString("abcdefghij")).toBe("abcd...");
    expect(trunctateString("longstring")).toBe("long...");
  });
});


