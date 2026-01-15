import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PatientConsoleShell from "@/layouts/PatientConsoleShell";

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: "pending" | "reviewed";
}

const PatientUploadReports = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [notes, setNotes] = useState("");

  const [uploadedDocuments] = useState<UploadedDocument[]>([
    { id: "1", name: "Blood_Test_Report.pdf", type: "Lab Report", uploadedAt: "2026-01-10", status: "reviewed" },
    { id: "2", name: "X-Ray_Chest.jpg", type: "Imaging", uploadedAt: "2026-01-05", status: "reviewed" },
    { id: "3", name: "Previous_Prescription.pdf", type: "Prescription", uploadedAt: "2026-01-02", status: "pending" },
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please select a file and document type",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Document Uploaded",
      description: "Your document has been uploaded successfully.",
    });
    setSelectedFile(null);
    setDocumentType("");
    setNotes("");
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <PatientConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Upload Reports</h1>
          <p className="text-muted-foreground">Share medical documents with your healthcare providers</p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab-report">Lab Report</SelectItem>
                  <SelectItem value="imaging">Imaging (X-Ray, MRI, CT)</SelectItem>
                  <SelectItem value="prescription">Previous Prescription</SelectItem>
                  <SelectItem value="discharge">Discharge Summary</SelectItem>
                  <SelectItem value="insurance">Insurance Document</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select File</Label>
              {!selectedFile ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Input 
                    type="file" 
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, PNG, DOC (max 10MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea 
                placeholder="Add any notes about this document..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button onClick={handleUpload} disabled={!selectedFile || !documentType}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardContent>
        </Card>

        {/* Uploaded Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedDocuments.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.type} • Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === "reviewed" ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Reviewed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-orange-600">
                        <Clock className="h-4 w-4" />
                        Pending Review
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientConsoleShell>
  );
};

export default PatientUploadReports;
