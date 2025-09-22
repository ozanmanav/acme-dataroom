import { DataRoomService } from "@/services/data-room-service";
import { storage } from "@/lib/storage";
import {
  generateUniqueFileName,
  readFileAsBase64,
} from "@/lib/utils-data-room";
import { FolderItem, FileItem } from "@/types";

// Mock the dependencies
jest.mock("@/lib/storage");
jest.mock("@/lib/utils-data-room");

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockGenerateUniqueFileName =
  generateUniqueFileName as jest.MockedFunction<typeof generateUniqueFileName>;
const mockReadFileAsBase64 = readFileAsBase64 as jest.MockedFunction<
  typeof readFileAsBase64
>;

describe("DataRoomService", () => {
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
  });

  describe("loadFolderContents", () => {
    it("should load folder contents successfully", async () => {
      const mockFolders: FolderItem[] = [createMockFolder()];
      const mockFiles: FileItem[] = [createMockFile()];

      mockStorage.getFoldersByParent.mockResolvedValue(mockFolders);
      mockStorage.getFilesByFolder.mockResolvedValue(mockFiles);
      mockStorage.getFullPath.mockResolvedValue([]);

      const result = await DataRoomService.loadFolderContents(null);

      expect(result.success).toBe(true);
      expect(result.data?.folders).toEqual(mockFolders);
      expect(result.data?.files).toEqual(mockFiles);
      expect(result.data?.breadcrumbs).toEqual([]);
      expect(mockStorage.getFoldersByParent).toHaveBeenCalledWith(null);
      expect(mockStorage.getFilesByFolder).toHaveBeenCalledWith(null);
    });

    it("should handle errors when loading folder contents", async () => {
      const error = new Error("Storage error");
      mockStorage.getFoldersByParent.mockRejectedValue(error);

      const result = await DataRoomService.loadFolderContents(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Storage error");
    });

    it("should build breadcrumbs for nested folder", async () => {
      const mockFolders: FolderItem[] = [];
      const mockFiles: FileItem[] = [];
      const mockPath: FolderItem[] = [
        createMockFolder({ id: "parent", name: "Parent" }),
        createMockFolder({ id: "child", name: "Child", parentId: "parent" }),
      ];

      mockStorage.getFoldersByParent.mockResolvedValue(mockFolders);
      mockStorage.getFilesByFolder.mockResolvedValue(mockFiles);
      mockStorage.getFullPath.mockResolvedValue(mockPath);

      const result = await DataRoomService.loadFolderContents("child");

      expect(result.success).toBe(true);
      expect(result.data?.breadcrumbs).toEqual([
        { id: "parent", name: "Parent", path: "/Parent" },
        { id: "child", name: "Child", path: "/Child" },
      ]);
    });
  });

  describe("createFolder", () => {
    it("should create folder successfully", async () => {
      const mockFolder = createMockFolder({ name: "New Folder" });
      mockStorage.createFolder.mockResolvedValue(mockFolder);

      const result = await DataRoomService.createFolder("New Folder", null);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFolder);
      expect(mockStorage.createFolder).toHaveBeenCalledWith("New Folder", null);
    });

    it("should handle empty folder name", async () => {
      const result = await DataRoomService.createFolder("  ", null);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Folder name cannot be empty");
      expect(mockStorage.createFolder).not.toHaveBeenCalled();
    });

    it("should handle errors when creating folder", async () => {
      const error = new Error("Creation failed");
      mockStorage.createFolder.mockRejectedValue(error);

      const result = await DataRoomService.createFolder("New Folder", null);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Creation failed");
    });
  });

  describe("deleteFolder", () => {
    it("should delete folder successfully", async () => {
      mockStorage.deleteFolder.mockResolvedValue(true);

      const result = await DataRoomService.deleteFolder("folder-id");

      expect(result.success).toBe(true);
      expect(mockStorage.deleteFolder).toHaveBeenCalledWith("folder-id");
    });

    it("should handle errors when deleting folder", async () => {
      const error = new Error("Deletion failed");
      mockStorage.deleteFolder.mockRejectedValue(error);

      const result = await DataRoomService.deleteFolder("folder-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Deletion failed");
    });
  });

  describe("uploadFiles", () => {
    it("should upload files successfully", async () => {
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      const mockCreatedFile = createMockFile({ name: "test.pdf" });
      const existingNames = ["existing.pdf"];

      mockReadFileAsBase64.mockResolvedValue("base64content");
      mockGenerateUniqueFileName.mockReturnValue("test.pdf");
      mockStorage.createFile.mockResolvedValue(mockCreatedFile);

      const result = await DataRoomService.uploadFiles(
        [mockFile],
        null,
        existingNames
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCreatedFile]);
      expect(mockReadFileAsBase64).toHaveBeenCalledWith(mockFile);
      // Check that generateUniqueFileName was called with the right filename
      expect(mockGenerateUniqueFileName).toHaveBeenCalledWith(
        "test.pdf",
        expect.any(Array)
      );
      expect(mockStorage.createFile).toHaveBeenCalledWith(
        "test.pdf",
        "base64content",
        7,
        null
      );
    });

    it("should handle upload errors gracefully", async () => {
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      const error = new Error("Upload failed");

      mockReadFileAsBase64.mockRejectedValue(error);

      const result = await DataRoomService.uploadFiles([mockFile], null, []);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should generate unique filename when file exists", async () => {
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      const mockCreatedFile = createMockFile({ name: "test_1.pdf" });
      const existingNames = ["test.pdf"];

      mockReadFileAsBase64.mockResolvedValue("base64content");
      mockGenerateUniqueFileName.mockReturnValue("test_1.pdf");
      mockStorage.createFile.mockResolvedValue(mockCreatedFile);

      const result = await DataRoomService.uploadFiles(
        [mockFile],
        null,
        existingNames
      );

      expect(result.success).toBe(true);
      expect(mockGenerateUniqueFileName).toHaveBeenCalledWith(
        "test.pdf",
        expect.any(Array)
      );
      expect(mockStorage.createFile).toHaveBeenCalledWith(
        "test_1.pdf",
        "base64content",
        7,
        null
      );
    });
  });

  describe("deleteFile", () => {
    it("should delete file successfully", async () => {
      mockStorage.deleteFile.mockResolvedValue(true);

      const result = await DataRoomService.deleteFile("file-id");

      expect(result.success).toBe(true);
      expect(mockStorage.deleteFile).toHaveBeenCalledWith("file-id");
    });

    it("should handle errors when deleting file", async () => {
      const error = new Error("Deletion failed");
      mockStorage.deleteFile.mockRejectedValue(error);

      const result = await DataRoomService.deleteFile("file-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Deletion failed");
    });
  });

  describe("searchItems", () => {
    it("should search items successfully", async () => {
      const mockResults = {
        folders: [createMockFolder({ name: "Test Folder" })],
        files: [createMockFile({ name: "test.pdf" })],
      };

      mockStorage.searchItems.mockResolvedValue(mockResults);

      const result = await DataRoomService.searchItems("test");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
      expect(mockStorage.searchItems).toHaveBeenCalledWith("test");
    });

    it("should return empty results for empty query", async () => {
      const result = await DataRoomService.searchItems("  ");

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ folders: [], files: [] });
      expect(mockStorage.searchItems).not.toHaveBeenCalled();
    });

    it("should handle search errors", async () => {
      const error = new Error("Search failed");
      mockStorage.searchItems.mockRejectedValue(error);

      const result = await DataRoomService.searchItems("test");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Search failed");
    });
  });

  describe("renameFolder", () => {
    it("should rename folder successfully", async () => {
      const mockUpdatedFolder = createMockFolder({ name: "Renamed Folder" });
      mockStorage.updateFolder.mockResolvedValue(mockUpdatedFolder);

      const result = await DataRoomService.renameFolder(
        "folder-id",
        "Renamed Folder"
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedFolder);
      expect(mockStorage.updateFolder).toHaveBeenCalledWith("folder-id", {
        name: "Renamed Folder",
      });
    });

    it("should handle empty name", async () => {
      const result = await DataRoomService.renameFolder("folder-id", "  ");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Folder name cannot be empty");
      expect(mockStorage.updateFolder).not.toHaveBeenCalled();
    });

    it("should handle folder not found", async () => {
      mockStorage.updateFolder.mockResolvedValue(null);

      const result = await DataRoomService.renameFolder(
        "folder-id",
        "New Name"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Folder not found");
    });

    it("should handle rename errors", async () => {
      const error = new Error("Rename failed");
      mockStorage.updateFolder.mockRejectedValue(error);

      const result = await DataRoomService.renameFolder(
        "folder-id",
        "New Name"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Rename failed");
    });
  });

  describe("renameFile", () => {
    it("should rename file successfully", async () => {
      const mockUpdatedFile = createMockFile({ name: "renamed.pdf" });
      mockStorage.updateFile.mockResolvedValue(mockUpdatedFile);

      const result = await DataRoomService.renameFile("file-id", "renamed.pdf");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedFile);
      expect(mockStorage.updateFile).toHaveBeenCalledWith("file-id", {
        name: "renamed.pdf",
      });
    });

    it("should handle empty name", async () => {
      const result = await DataRoomService.renameFile("file-id", "  ");

      expect(result.success).toBe(false);
      expect(result.error).toBe("File name cannot be empty");
      expect(mockStorage.updateFile).not.toHaveBeenCalled();
    });

    it("should handle file not found", async () => {
      mockStorage.updateFile.mockResolvedValue(null);

      const result = await DataRoomService.renameFile("file-id", "renamed.pdf");

      expect(result.success).toBe(false);
      expect(result.error).toBe("File not found");
    });

    it("should handle rename errors", async () => {
      const error = new Error("Rename failed");
      mockStorage.updateFile.mockRejectedValue(error);

      const result = await DataRoomService.renameFile("file-id", "renamed.pdf");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Rename failed");
    });
  });

  describe("getExistingNames", () => {
    it("should return combined folder and file names", () => {
      const folders = [
        createMockFolder({ name: "Folder 1" }),
        createMockFolder({ name: "Folder 2" }),
      ];
      const files = [
        createMockFile({ name: "file1.pdf" }),
        createMockFile({ name: "file2.pdf" }),
      ];

      const result = DataRoomService.getExistingNames(folders, files);

      expect(result).toEqual([
        "Folder 1",
        "Folder 2",
        "file1.pdf",
        "file2.pdf",
      ]);
    });

    it("should handle empty arrays", () => {
      const result = DataRoomService.getExistingNames([], []);

      expect(result).toEqual([]);
    });
  });
});
