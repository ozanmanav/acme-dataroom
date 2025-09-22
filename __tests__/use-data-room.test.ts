import { renderHook, act } from "@testing-library/react";
import { useDataRoom } from "@/hooks/data-room/use-data-room";

// Mock the data room store
const mockStore = {
  folders: [],
  files: [],
  breadcrumbs: [],
  currentFolderId: null,
  isLoading: false,
  isSearching: false,
  isUploading: false,
  error: null,
  loadFolderContents: jest.fn(),
  updateBreadcrumbs: jest.fn(),
  createFile: jest.fn(),
  updateFile: jest.fn(),
  deleteFile: jest.fn(),
  createFolder: jest.fn(),
  updateFolder: jest.fn(),
  deleteFolder: jest.fn(),
  searchItems: jest.fn(),
  clearSearch: jest.fn(),
  setCurrentFolderId: jest.fn(),
  uploadFiles: jest.fn(),
  getDisplayData: jest.fn(() => ({ folders: [], files: [] })),
  getExistingNames: jest.fn(() => []),
  clearError: jest.fn(),
};

jest.mock("@/lib/stores/data-room-store", () => ({
  useDataRoomStore: () => mockStore,
}));

describe("useDataRoom", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return store data and methods", () => {
    const { result } = renderHook(() => useDataRoom());

    expect(result.current.folders).toEqual([]);
    expect(result.current.files).toEqual([]);
    expect(result.current.breadcrumbs).toEqual([]);
    expect(result.current.currentFolderId).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe(null);

    expect(typeof result.current.loadFolderContents).toBe("function");
    expect(typeof result.current.createFolder).toBe("function");
    expect(typeof result.current.deleteFile).toBe("function");
    expect(typeof result.current.deleteFolder).toBe("function");
    expect(typeof result.current.uploadFiles).toBe("function");
    expect(typeof result.current.setCurrentFolderId).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  it("should call loadFolderContents on mount", () => {
    renderHook(() => useDataRoom());

    expect(mockStore.loadFolderContents).toHaveBeenCalledTimes(1);
  });

  it("should have display data and computed values", () => {
    const { result } = renderHook(() => useDataRoom());

    expect(result.current.displayFolders).toEqual([]);
    expect(result.current.displayFiles).toEqual([]);
    expect(typeof result.current.getExistingNames).toBe("function");
  });

  it("should have search functionality", () => {
    const { result } = renderHook(() => useDataRoom());

    expect(typeof result.current.searchItems).toBe("function");
    expect(typeof result.current.clearSearch).toBe("function");
  });

  it("should have file operations", () => {
    const { result } = renderHook(() => useDataRoom());

    expect(typeof result.current.createFile).toBe("function");
    expect(typeof result.current.updateFile).toBe("function");
    expect(typeof result.current.deleteFile).toBe("function");
  });

  it("should have folder operations", () => {
    const { result } = renderHook(() => useDataRoom());

    expect(typeof result.current.createFolder).toBe("function");
    expect(typeof result.current.updateFolder).toBe("function");
    expect(typeof result.current.deleteFolder).toBe("function");
  });
});
