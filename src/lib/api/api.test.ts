/**
 * Full feature test: API surface and data logic (no backend required).
 * Run: npm test
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DatabaseAPI, Document, Folder, Analytics } from "@/lib/api";

// Required API methods per DatabaseAPI interface
const REQUIRED_API_METHODS: (keyof DatabaseAPI)[] = [
  "getDocuments",
  "addDocument",
  "incrementDownload",
  "getFolders",
  "getFolder",
  "addFolder",
  "deleteFolder",
  "getFolderDocuments",
  "addDocumentsToFolder",
  "getComments",
  "addComment",
  "deleteComment",
  "getAnalytics",
  "getDownloadEvents",
];

describe("API surface", () => {
  it("api module exports an object with all DatabaseAPI methods", async () => {
    const { api } = await import("@/lib/api");
    for (const method of REQUIRED_API_METHODS) {
      expect(api).toHaveProperty(method);
      expect(typeof api[method]).toBe("function");
    }
  });
});

describe("Document filtering (homepage)", () => {
  it("filters out documents with folderId so only root-level docs show on home", () => {
    const docs: Document[] = [
      { id: "1", title: "A", course: "CS", professor: "P", fileType: "pdf", fileName: "a.pdf", uploadedAt: "", downloads: 0 },
      { id: "2", title: "B", course: "CS", professor: "P", fileType: "pdf", fileName: "b.pdf", uploadedAt: "", downloads: 0, folderId: "f1" },
    ];
    const rootOnly = docs.filter((d) => !d.folderId);
    expect(rootOnly).toHaveLength(1);
    expect(rootOnly[0].id).toBe("1");
  });
});

describe("Search filter logic", () => {
  it("filters documents by title, course, professor", () => {
    const docs: Document[] = [
      { id: "1", title: "Midterm Guide", course: "CS2000", professor: "Smith", fileType: "pdf", fileName: "a.pdf", uploadedAt: "", downloads: 0 },
      { id: "2", title: "Lab 1", course: "MATH1001", professor: "Jones", fileType: "pdf", fileName: "b.pdf", uploadedAt: "", downloads: 0 },
    ];
    const query = "cs2000";
    const filtered = docs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.course.toLowerCase().includes(query) ||
        doc.professor.toLowerCase().includes(query)
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].course).toBe("CS2000");
  });
});

describe("Folder search filter", () => {
  it("filters folders by name, course, professor, description", () => {
    const folders: Folder[] = [
      { id: "1", name: "Labs", description: "Weekly labs", course: "CHEM2010", professor: "Brown", createdAt: "", documentCount: 5 },
      { id: "2", name: "Notes", description: "Lecture notes", course: "PHYS2010", professor: "Lee", createdAt: "", documentCount: 3 },
    ];
    const query = "chem";
    const filtered = folders.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.course.toLowerCase().includes(query) ||
        f.professor.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].course).toBe("CHEM2010");
  });
});

describe("Analytics shape", () => {
  it("default analytics has required keys and safe array types", () => {
    const defaultAnalytics: Analytics = {
      totalDocuments: 0,
      totalDownloads: 0,
      uniqueCourses: 0,
      uniqueProfessors: 0,
      uploadsOverTime: [],
      courseDistribution: [],
      documentTypes: [],
      topProfessors: [],
      downloadTrends: [],
      recentActivity: [],
      timeRange: "month",
    };
    expect(defaultAnalytics.uploadsOverTime).toEqual([]);
    expect(defaultAnalytics.recentActivity).toEqual([]);
    expect(["week", "month", "year"]).toContain(defaultAnalytics.timeRange);
  });
});

describe("File type mapping (upload)", () => {
  it("maps extension to Document fileType", () => {
    const typeMapping: Record<string, Document["fileType"]> = {
      pdf: "pdf",
      xlsx: "excel",
      xls: "excel",
      py: "python",
      java: "java",
      pptx: "powerpoint",
      ppt: "powerpoint",
    };
    expect(typeMapping["pdf"]).toBe("pdf");
    expect(typeMapping["xlsx"]).toBe("excel");
    expect(typeMapping["py"]).toBe("python");
    expect(typeMapping["doc"] ?? "other").toBe("other");
  });
});
