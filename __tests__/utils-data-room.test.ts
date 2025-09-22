import {
  formatFileSize,
  formatDate,
  validateFileName,
  generateUniqueFileName,
  readFileAsBase64,
  downloadFile,
} from "@/lib/utils-data-room";

describe("utils-data-room.ts", () => {
  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(512)).toBe("512 B");
      expect(formatFileSize(1023)).toBe("1023 B");
    });

    it("should format kilobytes correctly", () => {
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(2048)).toBe("2.0 KB");
    });

    it("should format megabytes correctly", () => {
      expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe("1.5 MB");
      expect(formatFileSize(1024 * 1024 * 5)).toBe("5.0 MB");
    });

    it("should format gigabytes correctly", () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.0 GB");
      expect(formatFileSize(1024 * 1024 * 1024 * 2.5)).toBe("2.5 GB");
    });

    it("should handle very large files", () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe("1024.0 GB");
    });
  });

  describe("formatDate", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2023-01-15T12:00:00.000Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should format today correctly", () => {
      const today = new Date("2023-01-15T10:00:00.000Z");
      expect(formatDate(today)).toBe("Today");
    });

    it("should format yesterday correctly", () => {
      const yesterday = new Date("2023-01-14T10:00:00.000Z");
      expect(formatDate(yesterday)).toBe("Yesterday");
    });

    it("should format recent days correctly", () => {
      const threeDaysAgo = new Date("2023-01-12T10:00:00.000Z");
      expect(formatDate(threeDaysAgo)).toBe("3 days ago");

      const sixDaysAgo = new Date("2023-01-09T10:00:00.000Z");
      expect(formatDate(sixDaysAgo)).toBe("6 days ago");
    });

    it("should format older dates with full date", () => {
      const oneWeekAgo = new Date("2023-01-08T10:00:00.000Z");
      expect(formatDate(oneWeekAgo)).toBe("1/8/2023");
    });

    it("should handle string dates", () => {
      expect(formatDate("2023-01-15T10:00:00.000Z")).toBe("Today");
      expect(formatDate("2023-01-14T10:00:00.000Z")).toBe("Yesterday");
    });
  });

  describe("validateFileName", () => {
    it("should accept valid file names", () => {
      expect(validateFileName("document.pdf", [])).toBeNull();
      expect(validateFileName("my-file.docx", [])).toBeNull();
      expect(validateFileName("file_name.txt", [])).toBeNull();
      expect(validateFileName("simple", [])).toBeNull();
    });

    it("should reject empty names", () => {
      expect(validateFileName("", [])).toBe("Name cannot be empty");
      expect(validateFileName("   ", [])).toBe("Name cannot be empty");
    });

    it("should reject names that are too long", () => {
      const longName = "a".repeat(256);
      expect(validateFileName(longName, [])).toBe("Name is too long");
    });

    it("should reject names with invalid characters", () => {
      expect(validateFileName("file/name.txt", [])).toBe(
        "Name cannot contain / or \\"
      );
      expect(validateFileName("file\\name.txt", [])).toBe(
        "Name cannot contain / or \\"
      );
    });

    it("should reject duplicate names", () => {
      const existingNames = ["document.pdf", "file.txt"];
      expect(validateFileName("document.pdf", existingNames)).toBe(
        "Name already exists"
      );
      expect(validateFileName("file.txt", existingNames)).toBe(
        "Name already exists"
      );
    });

    it("should handle whitespace in names", () => {
      const existingNames = ["document.pdf"];
      expect(validateFileName(" document.pdf ", existingNames)).toBe(
        "Name already exists"
      );
    });
  });

  describe("generateUniqueFileName", () => {
    it("should return original name if unique", () => {
      expect(generateUniqueFileName("document.pdf", [])).toBe("document.pdf");
      expect(generateUniqueFileName("file.txt", ["other.txt"])).toBe(
        "file.txt"
      );
    });

    it("should generate unique names for files with extensions", () => {
      const existingNames = ["document.pdf", "document (1).pdf"];
      expect(generateUniqueFileName("document.pdf", existingNames)).toBe(
        "document (2).pdf"
      );
    });

    it("should generate unique names for files without extensions", () => {
      const existingNames = ["document", "document (1)"];
      expect(generateUniqueFileName("document", existingNames)).toBe(
        "document (2)"
      );
    });

    it("should handle complex scenarios", () => {
      const existingNames = [
        "file.txt",
        "file (1).txt",
        "file (2).txt",
        "file (3).txt",
      ];
      expect(generateUniqueFileName("file.txt", existingNames)).toBe(
        "file (4).txt"
      );
    });

    it("should handle files with multiple dots", () => {
      const existingNames = ["my.file.backup.txt"];
      expect(generateUniqueFileName("my.file.backup.txt", existingNames)).toBe(
        "my.file.backup (1).txt"
      );
    });
  });

  describe("readFileAsBase64", () => {
    it("should read file as base64", async () => {
      const mockFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const expectedBase64 = "dGVzdCBjb250ZW50";

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
        result: `data:text/plain;base64,${expectedBase64}`,
      };

      global.FileReader = jest.fn(() => mockFileReader) as any;

      const promise = readFileAsBase64(mockFile);

      // Trigger the onload event
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({} as ProgressEvent<FileReader>);
        }
      }, 0);

      const result = await promise;
      expect(result).toBe(expectedBase64);
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });

    it("should handle file read errors", async () => {
      const mockFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const mockError = new Error("File read failed");

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
        result: null,
      };

      global.FileReader = jest.fn(() => mockFileReader) as any;

      const promise = readFileAsBase64(mockFile);

      // Trigger the onerror event
      setTimeout(() => {
        if (mockFileReader.onerror) {
          mockFileReader.onerror(mockError as any);
        }
      }, 0);

      await expect(promise).rejects.toBe(mockError);
    });
  });

  describe("downloadFile", () => {
    let mockElement: jest.Mocked<HTMLAnchorElement>;
    let originalCreateElement: typeof document.createElement;
    let originalAppendChild: typeof document.body.appendChild;
    let originalRemoveChild: typeof document.body.removeChild;
    let originalCreateObjectURL: typeof URL.createObjectURL;
    let originalRevokeObjectURL: typeof URL.revokeObjectURL;
    let originalAtob: typeof atob;

    beforeEach(() => {
      mockElement = {
        href: "",
        download: "",
        click: jest.fn(),
      } as any;

      // Store original functions
      originalCreateElement = document.createElement;
      originalAppendChild = document.body.appendChild;
      originalRemoveChild = document.body.removeChild;
      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;
      originalAtob = global.atob;

      // Mock functions
      document.createElement = jest.fn().mockReturnValue(mockElement);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
      URL.createObjectURL = jest.fn().mockReturnValue("blob:mock-url");
      URL.revokeObjectURL = jest.fn();
      global.atob = jest.fn((str) => `decoded-${str}`);
    });

    afterEach(() => {
      // Restore original functions
      document.createElement = originalCreateElement;
      document.body.appendChild = originalAppendChild;
      document.body.removeChild = originalRemoveChild;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      global.atob = originalAtob;
    });

    it("should download file correctly", () => {
      const content = "base64content";
      const filename = "document.pdf";

      downloadFile(content, filename);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(global.atob).toHaveBeenCalledWith(content);
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockElement.href).toBe("blob:mock-url");
      expect(mockElement.download).toBe(filename);
      expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
      expect(mockElement.click).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(mockElement);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });
});
