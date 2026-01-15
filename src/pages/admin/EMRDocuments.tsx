import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, FileText, Image, File, Download, Trash2, Eye, Calendar, User } from "lucide-react";

interface Document {
  id: number;
  patientName: string;
  fileName: string;
  fileType: "pdf" | "image" | "doc";
  category: string;
  uploadDate: string;
  size: string;
}

const mockDocuments: Document[] = [
  { id: 1, patientName: "Rahul Sharma", fileName: "blood_report_jan2026.pdf", fileType: "pdf", category: "Lab Report", uploadDate: "2026-01-14", size: "245 KB" },
  { id: 2, patientName: "Rahul Sharma", fileName: "xray_chest.jpg", fileType: "image", category: "X-Ray", uploadDate: "2026-01-10", size: "1.2 MB" },
  { id: 3, patientName: "Priya Patel", fileName: "ecg_report.pdf", fileType: "pdf", category: "ECG", uploadDate: "2026-01-12", size: "156 KB" },
  { id: 4, patientName: "Amit Kumar", fileName: "prescription_old.pdf", fileType: "pdf", category: "Prescription", uploadDate: "2025-12-20", size: "89 KB" },
  { id: 5, patientName: "Priya Patel", fileName: "mri_brain.pdf", fileType: "pdf", category: "MRI", uploadDate: "2026-01-08", size: "3.4 MB" },
];

export default function EMRDocuments() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = ["all", ...new Set(mockDocuments.map(d => d.category))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="h-8 w-8 text-red-500" />;
      case "image": return <Image className="h-8 w-8 text-blue-500" />;
      default: return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patient Documents</h1>
            <p className="text-muted-foreground">Upload and manage patient documents and reports</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className={categoryFilter === cat ? "bg-emerald-600" : ""}
              >
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{doc.fileName}</h3>
                      <Badge variant="outline" className="shrink-0">{doc.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {doc.patientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground">Try adjusting your search or upload new documents</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ConsoleShell>
  );
}
