import { renderHook } from "@testing-library/react";
import { useClickOutside } from "@/hooks/ui/use-click-outside";

describe("useClickOutside", () => {
  let mockRef: React.RefObject<HTMLDivElement>;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockRef = { current: document.createElement("div") };
    mockCallback = jest.fn();

    // Add element to DOM for testing
    document.body.appendChild(mockRef.current!);
  });

  afterEach(() => {
    // Clean up
    if (mockRef.current) {
      document.body.removeChild(mockRef.current);
    }
    jest.clearAllMocks();
  });

  it("should call callback when clicking outside element", () => {
    renderHook(() => useClickOutside(mockRef, mockCallback));

    // Create and dispatch click event outside the element
    const outsideElement = document.createElement("div");
    document.body.appendChild(outsideElement);

    const clickEvent = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });

    outsideElement.dispatchEvent(clickEvent);

    expect(mockCallback).toHaveBeenCalledTimes(1);

    document.body.removeChild(outsideElement);
  });

  it("should not call callback when clicking inside element", () => {
    renderHook(() => useClickOutside(mockRef, mockCallback));

    // Create and dispatch click event inside the element
    const clickEvent = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });

    mockRef.current!.dispatchEvent(clickEvent);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should not call callback when ref is null", () => {
    const nullRef = { current: null };
    renderHook(() => useClickOutside(nullRef, mockCallback));

    // Dispatch click event
    const clickEvent = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(clickEvent);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should clean up event listener on unmount", () => {
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() =>
      useClickOutside(mockRef, mockCallback)
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
