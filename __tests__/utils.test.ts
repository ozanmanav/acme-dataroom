import { cn } from "@/lib/utils";

describe("utils.ts", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("px-2 py-1", "text-sm", "hover:bg-gray-100");
      expect(result).toBe("px-2 py-1 text-sm hover:bg-gray-100");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("px-2 py-1", isActive && "bg-blue-500", "text-white");
      expect(result).toBe("px-2 py-1 bg-blue-500 text-white");
    });

    it("should handle conflicting Tailwind classes", () => {
      const result = cn("px-2 px-4", "py-1 py-2");
      expect(result).toBe("px-4 py-2");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["px-2", "py-1"], "text-sm");
      expect(result).toBe("px-2 py-1 text-sm");
    });

    it("should handle undefined and null values", () => {
      const result = cn("px-2", undefined, null, "py-1");
      expect(result).toBe("px-2 py-1");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });
  });
});
