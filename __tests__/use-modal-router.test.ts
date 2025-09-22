import { renderHook, act } from "@testing-library/react";
import { useModalRouter, useModalActions } from "@/hooks/use-modal-router";

describe("useModalRouter", () => {
  it("should initialize with no active modal", () => {
    const { result } = renderHook(() => useModalRouter());

    expect(result.current.modal.type).toBeNull();
    expect(result.current.modal.props).toBeUndefined();
  });

  it("should open modal with props", () => {
    const { result } = renderHook(() => useModalRouter());

    act(() => {
      result.current.openModal("create-folder", { existingNames: ["folder1"] });
    });

    expect(result.current.modal.type).toBe("create-folder");
    expect(result.current.modal.props).toEqual({ existingNames: ["folder1"] });
  });

  it("should close modal", () => {
    const { result } = renderHook(() => useModalRouter());

    act(() => {
      result.current.openModal("create-folder", { existingNames: ["folder1"] });
    });

    expect(result.current.modal.type).toBe("create-folder");

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.modal.type).toBeNull();
    expect(result.current.modal.props).toBeUndefined();
  });

  it("should replace current modal when opening new one", () => {
    const { result } = renderHook(() => useModalRouter());

    act(() => {
      result.current.openModal("create-folder", { existingNames: ["folder1"] });
    });

    expect(result.current.modal.type).toBe("create-folder");

    act(() => {
      result.current.openModal("rename", {
        item: { name: "file.pdf" },
        type: "file",
      });
    });

    expect(result.current.modal.type).toBe("rename");
    expect(result.current.modal.props).toEqual({
      item: { name: "file.pdf" },
      type: "file",
    });
  });

  it("should check if modal is open", () => {
    const { result } = renderHook(() => useModalRouter());

    expect(result.current.isOpen("create-folder")).toBe(false);

    act(() => {
      result.current.openModal("create-folder");
    });

    expect(result.current.isOpen("create-folder")).toBe(true);
    expect(result.current.isOpen("rename")).toBe(false);
  });
});

describe("useModalActions", () => {
  it("should provide modal action methods", () => {
    const { result } = renderHook(() => useModalActions());

    expect(typeof result.current.openFileUpload).toBe("function");
    expect(typeof result.current.openCreateFolder).toBe("function");
    expect(typeof result.current.openRename).toBe("function");
    expect(typeof result.current.openDelete).toBe("function");
    expect(typeof result.current.openPreview).toBe("function");
    expect(typeof result.current.closeModal).toBe("function");
  });

  it("should open file upload modal", () => {
    const { result: modalResult } = renderHook(() => useModalRouter());
    const { result: actionsResult } = renderHook(() => useModalActions());

    act(() => {
      actionsResult.current.openFileUpload();
    });

    expect(modalResult.current.modal.type).toBe("file-upload");
  });

  it("should open create folder modal", () => {
    const { result: modalResult } = renderHook(() => useModalRouter());
    const { result: actionsResult } = renderHook(() => useModalActions());

    act(() => {
      actionsResult.current.openCreateFolder();
    });

    expect(modalResult.current.modal.type).toBe("create-folder");
  });

  it("should open rename modal with item data", () => {
    const { result: modalResult } = renderHook(() => useModalRouter());
    const { result: actionsResult } = renderHook(() => useModalActions());

    const item = { id: "1", name: "document.pdf" };

    act(() => {
      actionsResult.current.openRename(item, "file");
    });

    expect(modalResult.current.modal.type).toBe("rename");
    expect(modalResult.current.modal.props).toEqual({
      item,
      type: "file",
    });
  });

  it("should open delete modal with item data", () => {
    const { result: modalResult } = renderHook(() => useModalRouter());
    const { result: actionsResult } = renderHook(() => useModalActions());

    const item = { id: "1", name: "folder1" };

    act(() => {
      actionsResult.current.openDelete(item, "folder");
    });

    expect(modalResult.current.modal.type).toBe("delete");
    expect(modalResult.current.modal.props).toEqual({
      item,
      type: "folder",
    });
  });

  it("should open preview modal with file data", () => {
    const { result: modalResult } = renderHook(() => useModalRouter());
    const { result: actionsResult } = renderHook(() => useModalActions());

    const file = { id: "1", name: "document.pdf", content: "base64content" };

    act(() => {
      actionsResult.current.openPreview(file);
    });

    expect(modalResult.current.modal.type).toBe("preview");
    expect(modalResult.current.modal.props).toEqual({ file });
  });

  it("should close modal", () => {
    const { result: modalResult } = renderHook(() => useModalRouter());
    const { result: actionsResult } = renderHook(() => useModalActions());

    act(() => {
      actionsResult.current.openCreateFolder();
    });

    expect(modalResult.current.modal.type).toBe("create-folder");

    act(() => {
      actionsResult.current.closeModal();
    });

    expect(modalResult.current.modal.type).toBeNull();
  });
});
