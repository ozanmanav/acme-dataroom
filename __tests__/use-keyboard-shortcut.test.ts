import { renderHook } from "@testing-library/react";
import { useKeyboardShortcut } from "@/hooks/ui/use-keyboard-shortcut";

describe("useKeyboardShortcut", () => {
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call callback on correct key combination", () => {
    renderHook(() => useKeyboardShortcut("s", mockCallback, { ctrlKey: true }));

    // Simulate Ctrl+S
    const keyEvent = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should not call callback on wrong key combination", () => {
    renderHook(() => useKeyboardShortcut("s", mockCallback, { ctrlKey: true }));

    // Simulate just 's' without Ctrl
    const keyEvent = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: false,
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should not call callback on wrong key", () => {
    renderHook(() => useKeyboardShortcut("s", mockCallback, { ctrlKey: true }));

    // Simulate Ctrl+A (wrong key)
    const keyEvent = new KeyboardEvent("keydown", {
      key: "a",
      ctrlKey: true,
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should handle shift modifier", () => {
    renderHook(() =>
      useKeyboardShortcut("Delete", mockCallback, { shiftKey: true })
    );

    // Simulate Shift+Delete
    const keyEvent = new KeyboardEvent("keydown", {
      key: "Delete",
      shiftKey: true,
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should handle alt modifier", () => {
    renderHook(() => useKeyboardShortcut("F4", mockCallback, { altKey: true }));

    // Simulate Alt+F4
    const keyEvent = new KeyboardEvent("keydown", {
      key: "F4",
      altKey: true,
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple modifiers", () => {
    renderHook(() =>
      useKeyboardShortcut("z", mockCallback, { ctrlKey: true, shiftKey: true })
    );

    // Simulate Ctrl+Shift+Z
    const keyEvent = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should not trigger when missing modifiers", () => {
    renderHook(() =>
      useKeyboardShortcut("z", mockCallback, { ctrlKey: true, shiftKey: true })
    );

    // Simulate Ctrl+Z (missing shift)
    const keyEvent = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
      shiftKey: false,
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should handle key without modifiers", () => {
    renderHook(() => useKeyboardShortcut("Enter", mockCallback));

    // Simulate Enter key without modifiers
    const keyEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should handle escape key", () => {
    renderHook(() => useKeyboardShortcut("Escape", mockCallback));

    // Simulate Escape
    const keyEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should handle complex key combinations", () => {
    renderHook(() =>
      useKeyboardShortcut("s", mockCallback, {
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
      })
    );

    // Simulate Ctrl+Shift+Alt+S
    const keyEvent = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      shiftKey: true,
      altKey: true,
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should not trigger with extra modifiers", () => {
    renderHook(() => useKeyboardShortcut("s", mockCallback, { ctrlKey: true }));

    // Simulate Ctrl+Shift+S (extra shift modifier)
    const keyEvent = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    document.dispatchEvent(keyEvent);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should clean up event listener on unmount", () => {
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() =>
      useKeyboardShortcut("s", mockCallback, { ctrlKey: true })
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("should handle callback dependency changes", () => {
    let callbackCallCount = 0;
    const callback1 = () => {
      callbackCallCount++;
    };
    const callback2 = jest.fn();

    const { rerender } = renderHook(
      ({ callback }) => useKeyboardShortcut("s", callback, { ctrlKey: true }),
      { initialProps: { callback: callback1 } }
    );

    // Trigger with first callback
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
      })
    );
    expect(callbackCallCount).toBe(1);

    // Change callback and trigger again
    rerender({ callback: callback2 });
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
      })
    );

    // First callback should not be called again
    expect(callbackCallCount).toBe(1);
    // Second callback should be called
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
