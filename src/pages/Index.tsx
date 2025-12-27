import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { DocumentGrid } from "@/components/DocumentGrid";
import { UploadModal, UploadData } from "@/components/UploadModal";
import { Document } from "@/components/DocumentCard";

// Sample data - in a real app, this would come from a database
const sampleDocuments: Document[] = [
  {
    id: "1",
    title: "Data Structures Final Review",
    course: "CS2000",
    professor: "Prof. Elizabeth Wilson",
    fileType: "pdf",
    uploadDate: "Dec 20, 2024",
    downloads: 234,
  },
  {
    id: "2",
    title: "Linear Algebra Practice Problems",
    course: "MATH1001",
    professor: "Dr. James Chen",
    fileType: "pdf",
    uploadDate: "Dec 19, 2024",
    downloads: 189,
  },
  {
    id: "3",
    title: "Binary Search Tree Implementation",
    course: "CS2000",
    professor: "Prof. Elizabeth Wilson",
    fileType: "python",
    uploadDate: "Dec 18, 2024",
    downloads: 156,
  },
  {
    id: "4",
    title: "Physics Lab Data Analysis",
    course: "PHYS2010",
    professor: "Dr. Sarah Miller",
    fileType: "excel",
    uploadDate: "Dec 17, 2024",
    downloads: 98,
  },
  {
    id: "5",
    title: "Microeconomics Chapter 5 Notes",
    course: "ECON3000",
    professor: "Prof. Michael Brown",
    fileType: "powerpoint",
    uploadDate: "Dec 16, 2024",
    downloads: 145,
  },
  {
    id: "6",
    title: "Object-Oriented Programming Guide",
    course: "CS2000",
    professor: "Prof. Elizabeth Wilson",
    fileType: "java",
    uploadDate: "Dec 15, 2024",
    downloads: 267,
  },
  {
    id: "7",
    title: "Calculus II Formula Sheet",
    course: "MATH1001",
    professor: "Dr. James Chen",
    fileType: "pdf",
    uploadDate: "Dec 14, 2024",
    downloads: 312,
  },
  {
    id: "8",
    title: "Thermodynamics Lecture Slides",
    course: "PHYS2010",
    professor: "Dr. Sarah Miller",
    fileType: "powerpoint",
    uploadDate: "Dec 13, 2024",
    downloads: 87,
  },
  {
    id: "9",
    title: "Market Analysis Project Template",
    course: "ECON3000",
    professor: "Prof. Michael Brown",
    fileType: "excel",
    uploadDate: "Dec 12, 2024",
    downloads: 124,
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);

  const handleUpload = (data: UploadData) => {
    const fileType = data.file?.name.split('.').pop()?.toLowerCase() || 'pdf';
    const typeMapping: Record<string, string> = {
      pdf: 'pdf',
      xlsx: 'excel',
      xls: 'excel',
      py: 'python',
      java: 'java',
      pptx: 'powerpoint',
      ppt: 'powerpoint',
    };

    const newDoc: Document = {
      id: Date.now().toString(),
      title: data.title,
      course: data.course,
      professor: data.professor,
      fileType: typeMapping[fileType] || 'pdf',
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      downloads: 0,
    };

    setDocuments([newDoc, ...documents]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onUploadClick={() => setIsUploadOpen(true)} />
      <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Stats />
      <DocumentGrid documents={documents} searchQuery={searchQuery} />
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUpload={handleUpload}
      />

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 StudyHub. Helping students succeed together.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
