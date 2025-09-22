import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { storage } from "@/lib/storage";
import {
  generateUniqueFileName,
  readFileAsBase64,
} from "@/lib/utils-data-room";
import { FolderItem, FileItem } from "@/types";
import { renderHook, act } from "@testing-library/react";

// Mock the dependencies
jest.mock("@/lib/storage");
jest.mock("@/lib/utils-data-room");

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockGenerateUniqueFileName =
  generateUniqueFileName as jest.MockedFunction<typeof generateUniqueFileName>;
const mockReadFileAsBase64 = readFileAsBase64 as jest.MockedFunction<
  typeof readFileAsBase64
>;

describe("data-room-store.ts", () => {
  const mockDate = new Date("2023-01-01T00:00:00.000Z");

  const createMockFolder = (overrides?: Partial<FolderItem>): FolderItem => ({
    id: "1",
    name: "Test Folder",
    parentId: null,
    createdAt: mockDate,
    updatedAt: mockDate,
    ...overrides,
  });

  const createMockFile = (overrides?: Partial<FileItem>): FileItem => ({
    id: "1",
    name: "test.pdf",
    type: "pdf",
    size: 1024,
    content: "base64content",
    folderId: null,
    createdAt: mockDate,
    updatedAt: mockDate,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset store state
    useDataRoomStore.setState({
      folders: [],
      files: [],
      breadcrumbs: [],
      currentFolderId: null,
      searchResults: null,
      isLoading: false,
      isSearching: false,
      isUploading: false,
      error: null,
    });
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useDataRoomStore());

      expect(result.current.folders).toEqual([]);
      expect(result.current.files).toEqual([]);
      expect(result.current.breadcrumbs).toEqual([]);
      expect(result.current.currentFolderId).toBeNull();
      expect(result.current.searchResults).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Basic Setters", () => {
    it("should set folders", () => {
      const { result } = renderHook(() => useDataRoomStore());
      const folders = [createMockFolder()];

      act(() => {
        result.current.setFolders(folders);
      });

      expect(result.current.folders).toEqual(folders);
    });

    it("should set files", () => {
      const { result } = renderHook(() => useDataRoomStore());
      const files = [createMockFile()];

      act(() => {
        result.current.setFiles(files);
      });

      expect(result.current.files).toEqual(files);
    });

    it("should set breadcrumbs", () => {
      const { result } = renderHook(() => useDataRoomStore());
      const breadcrumbs = [{ id: "1", name: "Test", path: "/test" }];

      act(() => {
        result.current.setBreadcrumbs(breadcrumbs);
      });

      expect(result.current.breadcrumbs).toEqual(breadcrumbs);
    });

    it("should set current folder id", () => {
      const { result } = renderHook(() => useDataRoomStore());

      act(() => {
        result.current.setCurrentFolderId("folder-1");
      });

      expect(result.current.currentFolderId).toBe("folder-1");
    });

    it("should set search results", () => {
      const { result } = renderHook(() => useDataRoomStore());
      const searchResults = {
        folders: [createMockFolder()],
        files: [createMockFile()],
      };

      act(() => {
        result.current.setSearchResults(searchResults);
      });

      expect(result.current.searchResults).toEqual(searchResults);
    });

    it("should set and clear error", () => {
      const { result } = renderHook(() => useDataRoomStore());

      act(() => {
        result.current.setError("Test error");
      });

      expect(result.current.error).toBe("Test error");

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("loadFolderContents", () => {
    it("should load folder contents successfully", async () => {
      const { result } = renderHook(() => useDataRoomStore());
      const mockFolders = [createMockFolder()];
      const mockFiles = [createMockFile()];

      mockStorage.getFoldersByParent.mockResolvedValue(mockFolders);
      mockStorage.getFilesByFolder.mockResolvedValue(mockFiles);

      await act(async () => {
        await result.current.loadFolderContents(null);
      });

      expect(result.current.folders).toEqual(mockFolders);
      expect(result.current.files).toEqual(mockFiles);
      expect(result.current.currentFolderId).toBeNull();
      expect(result.current.searchResults).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle loading errors", async () => {
      const { result } = renderHook(() => useDataRoomStore());
      const error = new Error("Loading failed");

      mockStorage.getFoldersByParent.mockRejectedValue(error);

      await act(async () => {
        await result.current.loadFolderContents(null);
      });

      expect(result.current.error).toBe("Loading failed");
      expect(result.current.isLoading).toBe(false);
    });

    it("should use current folder id when no folder id provided", async () => {
      const { result } = renderHook(() => useDataRoomStore());

      // Set current folder id first
      act(() => {
        result.current.setCurrentFolderId("folder-1");
      });

      mockStorage.getFoldersByParent.mockResolvedValue([]);
      mockStorage.getFilesByFolder.mockResolvedValue([]);

      await act(async () => {
        await result.current.loadFolderContents();
      });

      expect(mockStorage.getFoldersByParent).toHaveBeenCalledWith("folder-1");
      expect(mockStorage.getFilesByFolder).toHaveBeenCalledWith("folder-1");
    });
  });

  describe("updateBreadcrumbs", () => {
    it("should set empty breadcrumbs for root folder", async () => {
      const { result } = renderHook(() => useDataRoomStore());

      await act(async () => {
        await result.current.updateBreadcrumbs(null);
      });

      expect(result.current.breadcrumbs).toEqual([]);
    });

    it("should build breadcrumbs for nested folder", async () => {
      const { result } = renderHook(() => useDataRoomStore());
      const mockPath = [
        createMockFolder({ id: "parent", name: "Parent" }),
        createMockFolder({ id: "child", name: "Child", parentId: "parent" }),
      ];

      mockStorage.getFullPath.mockResolvedValue(mockPath);

      await act(async () => {
        await result.current.updateBreadcrumbs("child");
      });

      expect(result.current.breadcrumbs).toEqual([
        { id: "parent", name: "Parent", path: "/Parent" },
        { id: "child", name: "Child", path: "/Child" },
      ]);
    });
  });

  describe("searchItems", () => {
    it("should search and set results", async () => {
      const { result } = renderHook(() => useDataRoomStore());
      const searchResults = {
        folders: [createMockFolder()],
        files: [createMockFile()],
      };

      mockStorage.searchItems.mockResolvedValue(searchResults);

      await act(async () => {
        await result.current.searchItems("test");
      });

      expect(result.current.searchResults).toEqual(searchResults);
      expect(mockStorage.searchItems).toHaveBeenCalledWith("test");
    });

    it("should clear search results", () => {
      const { result } = renderHook(() => useDataRoomStore());

      // Set search results first
      act(() => {
        result.current.setSearchResults({ folders: [], files: [] });
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.searchResults).toBeNull();
    });
  });

  describe("CRUD Operations", () => {
    describe("createFolder", () => {
      it("should create folder and reload contents", async () => {
        const { result } = renderHook(() => useDataRoomStore());

        mockStorage.createFolder.mockResolvedValue(createMockFolder());
        mockStorage.getFoldersByParent.mockResolvedValue([]);
        mockStorage.getFilesByFolder.mockResolvedValue([]);

        await act(async () => {
          await result.current.createFolder("New Folder", null);
        });

        expect(mockStorage.createFolder).toHaveBeenCalledWith(
          "New Folder",
          null
        );
      });
    });

    describe("updateFolder", () => {
      it("should update folder and reload contents", async () => {
        const { result } = renderHook(() => useDataRoomStore());

        mockStorage.updateFolder.mockResolvedValue(createMockFolder());
        mockStorage.getFoldersByParent.mockResolvedValue([]);
        mockStorage.getFilesByFolder.mockResolvedValue([]);

        await act(async () => {
          await result.current.updateFolder("folder-1", {
            name: "Updated Name",
          });
        });

        expect(mockStorage.updateFolder).toHaveBeenCalledWith("folder-1", {
          name: "Updated Name",
        });
      });
    });

    describe("deleteFolder", () => {
      it("should delete folder and reload contents", async () => {
        const { result } = renderHook(() => useDataRoomStore());

        mockStorage.deleteFolder.mockResolvedValue(true);
        mockStorage.getFoldersByParent.mockResolvedValue([]);
        mockStorage.getFilesByFolder.mockResolvedValue([]);

        await act(async () => {
          await result.current.deleteFolder("folder-1");
        });

        expect(mockStorage.deleteFolder).toHaveBeenCalledWith("folder-1");
      });
    });

    describe("createFile", () => {
      it("should create file and reload contents", async () => {
        const { result } = renderHook(() => useDataRoomStore());
        const fileData = {
          name: "test.pdf",
          type: "pdf" as const,
          size: 1024,
          content: "base64content",
          folderId: null,
        };

        mockStorage.createFile.mockResolvedValue(createMockFile());
        mockStorage.getFoldersByParent.mockResolvedValue([]);
        mockStorage.getFilesByFolder.mockResolvedValue([]);

        await act(async () => {
          await result.current.createFile(fileData);
        });

        expect(mockStorage.createFile).toHaveBeenCalledWith(
          "test.pdf",
          "base64content",
          1024,
          null
        );
      });
    });

    describe("updateFile", () => {
      it("should update file and reload contents", async () => {
        const { result } = renderHook(() => useDataRoomStore());

        mockStorage.updateFile.mockResolvedValue(createMockFile());
        mockStorage.getFoldersByParent.mockResolvedValue([]);
        mockStorage.getFilesByFolder.mockResolvedValue([]);

        await act(async () => {
          await result.current.updateFile("file-1", { name: "updated.pdf" });
        });

        expect(mockStorage.updateFile).toHaveBeenCalledWith("file-1", {
          name: "updated.pdf",
        });
      });
    });

    describe("deleteFile", () => {
      it("should delete file and reload contents", async () => {
        const { result } = renderHook(() => useDataRoomStore());

        mockStorage.deleteFile.mockResolvedValue(true);
        mockStorage.getFoldersByParent.mockResolvedValue([]);
        mockStorage.getFilesByFolder.mockResolvedValue([]);

        await act(async () => {
          await result.current.deleteFile("file-1");
        });

        expect(mockStorage.deleteFile).toHaveBeenCalledWith("file-1");
      });
    });
  });

  describe("uploadFiles", () => {
    it("should upload files successfully", async () => {
      const { result } = renderHook(() => useDataRoomStore());
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      mockReadFileAsBase64.mockResolvedValue("base64content");
      mockGenerateUniqueFileName.mockReturnValue("test.pdf");
      mockStorage.createFile.mockResolvedValue(createMockFile());
      mockStorage.getFoldersByParent.mockResolvedValue([]);
      mockStorage.getFilesByFolder.mockResolvedValue([]);

      await act(async () => {
        await result.current.uploadFiles([mockFile]);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockStorage.createFile).toHaveBeenCalledWith(
        "test.pdf",
        "base64content",
        7,
        null
      );
    });

    it("should handle upload errors", async () => {
      const { result } = renderHook(() => useDataRoomStore());
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      const error = new Error("Upload failed");

      mockReadFileAsBase64.mockRejectedValue(error);

      await act(async () => {
        await result.current.uploadFiles([mockFile]);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBe("Upload failed");
    });

    it("should generate unique filenames", async () => {
      const { result } = renderHook(() => useDataRoomStore());
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      // Set existing files in store
      act(() => {
        result.current.setFiles([createMockFile({ name: "test.pdf" })]);
        result.current.setFolders([
          createMockFolder({ name: "existing-folder" }),
        ]);
      });

      mockReadFileAsBase64.mockResolvedValue("base64content");
      mockGenerateUniqueFileName.mockReturnValue("test (1).pdf");
      mockStorage.createFile.mockResolvedValue(createMockFile());
      mockStorage.getFoldersByParent.mockResolvedValue([]);
      mockStorage.getFilesByFolder.mockResolvedValue([]);

      await act(async () => {
        await result.current.uploadFiles([mockFile]);
      });

      // Verify that generateUniqueFileName was called with the original filename
      expect(mockGenerateUniqueFileName).toHaveBeenCalledWith(
        "test.pdf",
        expect.any(Array)
      );
      expect(mockStorage.createFile).toHaveBeenCalledWith(
        "test (1).pdf",
        "base64content",
        7,
        null
      );
    });
  });

  describe("Computed Values", () => {
    describe("getDisplayData", () => {
      it("should return folders and files when no search results", () => {
        const { result } = renderHook(() => useDataRoomStore());
        const folders = [createMockFolder()];
        const files = [createMockFile()];

        act(() => {
          result.current.setFolders(folders);
          result.current.setFiles(files);
        });

        const displayData = result.current.getDisplayData();
        expect(displayData).toEqual({ folders, files });
      });

      it("should return search results when available", () => {
        const { result } = renderHook(() => useDataRoomStore());
        const folders = [createMockFolder()];
        const files = [createMockFile()];
        const searchResults = { folders: [], files: [] };

        act(() => {
          result.current.setFolders(folders);
          result.current.setFiles(files);
          result.current.setSearchResults(searchResults);
        });

        const displayData = result.current.getDisplayData();
        expect(displayData).toEqual(searchResults);
      });
    });

    describe("getExistingNames", () => {
      it("should return combined folder and file names", () => {
        const { result } = renderHook(() => useDataRoomStore());
        const folders = [
          createMockFolder({ name: "Folder1" }),
          createMockFolder({ name: "Folder2" }),
        ];
        const files = [
          createMockFile({ name: "file1.pdf" }),
          createMockFile({ name: "file2.pdf" }),
        ];

        act(() => {
          result.current.setFolders(folders);
          result.current.setFiles(files);
        });

        const existingNames = result.current.getExistingNames();
        expect(existingNames).toEqual([
          "Folder1",
          "Folder2",
          "file1.pdf",
          "file2.pdf",
        ]);
      });

      it("should return empty array when no folders or files", () => {
        const { result } = renderHook(() => useDataRoomStore());

        const existingNames = result.current.getExistingNames();
        expect(existingNames).toEqual([]);
      });
    });
  });
});
