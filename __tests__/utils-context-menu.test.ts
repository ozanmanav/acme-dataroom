import {
  calculateContextMenuPosition,
  CONTEXT_MENU_CONSTANTS,
} from "@/lib/utils-context-menu";

// Mock window dimensions
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, "innerHeight", {
  writable: true,
  configurable: true,
  value: 768,
});

describe("utils-context-menu.ts", () => {
  describe("CONTEXT_MENU_CONSTANTS", () => {
    it("should have correct constant values", () => {
      expect(CONTEXT_MENU_CONSTANTS.MIN_WIDTH).toBe(180);
      expect(CONTEXT_MENU_CONSTANTS.ITEM_HEIGHT).toBe(40);
      expect(CONTEXT_MENU_CONSTANTS.VIEWPORT_PADDING).toBe(10);
    });
  });

  describe("calculateContextMenuPosition", () => {
    beforeEach(() => {
      // Reset window dimensions
      window.innerWidth = 1024;
      window.innerHeight = 768;
    });

    it("should return position when menu fits in viewport", () => {
      const position = { x: 100, y: 100 };
      const itemCount = 3;

      const result = calculateContextMenuPosition(position, itemCount);

      expect(result).toEqual({
        position: "fixed",
        left: 100,
        top: 100,
        zIndex: 1000,
      });
    });

    it("should adjust position when menu exceeds right edge", () => {
      const position = { x: 900, y: 100 };
      const itemCount = 3;
      const menuWidth = 200;

      const result = calculateContextMenuPosition(
        position,
        itemCount,
        menuWidth
      );

      // Should be adjusted to fit within viewport
      const expectedLeft = 1024 - 200 - 10; // innerWidth - menuWidth - padding
      expect(result).toEqual({
        position: "fixed",
        left: expectedLeft,
        top: 100,
        zIndex: 1000,
      });
    });

    it("should adjust position when menu exceeds bottom edge", () => {
      const position = { x: 100, y: 700 };
      const itemCount = 5; // 5 * 40 = 200px height

      const result = calculateContextMenuPosition(position, itemCount);

      // Should be adjusted to fit within viewport
      const expectedTop = 768 - 200 - 10; // innerHeight - menuHeight - padding
      expect(result).toEqual({
        position: "fixed",
        left: 100,
        top: expectedTop,
        zIndex: 1000,
      });
    });

    it("should adjust position when menu exceeds both edges", () => {
      const position = { x: 900, y: 700 };
      const itemCount = 5;
      const menuWidth = 200;

      const result = calculateContextMenuPosition(
        position,
        itemCount,
        menuWidth
      );

      const expectedLeft = 1024 - 200 - 10;
      const expectedTop = 768 - 200 - 10;

      expect(result).toEqual({
        position: "fixed",
        left: expectedLeft,
        top: expectedTop,
        zIndex: 1000,
      });
    });

    it("should enforce minimum padding from viewport edges", () => {
      const position = { x: 5, y: 5 };
      const itemCount = 3;

      const result = calculateContextMenuPosition(position, itemCount);

      expect(result).toEqual({
        position: "fixed",
        left: 10, // Should be at least VIEWPORT_PADDING
        top: 10, // Should be at least VIEWPORT_PADDING
        zIndex: 1000,
      });
    });

    it("should use default menu width when not provided", () => {
      const position = { x: 900, y: 100 };
      const itemCount = 3;

      const result = calculateContextMenuPosition(position, itemCount);

      // Should use MIN_WIDTH (180) as default
      const expectedLeft = 1024 - 180 - 10;
      expect(result).toEqual({
        position: "fixed",
        left: expectedLeft,
        top: 100,
        zIndex: 1000,
      });
    });

    it("should handle small viewport", () => {
      window.innerWidth = 320;
      window.innerHeight = 240;

      const position = { x: 200, y: 200 };
      const itemCount = 4;
      const menuWidth = 150;

      const result = calculateContextMenuPosition(
        position,
        itemCount,
        menuWidth
      );

      const expectedLeft = 320 - 150 - 10;
      const expectedTop = 240 - 160 - 10; // 4 items * 40px height

      expect(result).toEqual({
        position: "fixed",
        left: expectedLeft,
        top: expectedTop,
        zIndex: 1000,
      });
    });

    it("should handle zero item count", () => {
      const position = { x: 100, y: 100 };
      const itemCount = 0;

      const result = calculateContextMenuPosition(position, itemCount);

      expect(result).toEqual({
        position: "fixed",
        left: 100,
        top: 100,
        zIndex: 1000,
      });
    });

    it("should handle negative coordinates", () => {
      const position = { x: -50, y: -50 };
      const itemCount = 3;

      const result = calculateContextMenuPosition(position, itemCount);

      expect(result).toEqual({
        position: "fixed",
        left: 10, // Should be clamped to minimum padding
        top: 10, // Should be clamped to minimum padding
        zIndex: 1000,
      });
    });
  });
});
