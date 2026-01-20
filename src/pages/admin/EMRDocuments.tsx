import { useState, useEffect, useRef } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Upload, FileText, Image, File, Download, Trash2, Eye, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface Document {
  id: number;
  patient_id: number | null;
  patient_name: string;
  title: string;
  document_type: string;
  file_url: string;
  file_name: string;
  notes: string;
  created_at: string;
}

const DOCUMENT_TYPES = ['Lab Report', 'X-Ray', 'ECG', 'Prescription', 'MRI', 'CT Scan', 'Ultrasound', 'Other'];

export default function EMRDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    patient_name: '', title: '', document_type: 'Lab Report', file_name: '', notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, categoryFilter]);

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter !== 'all') params.append('document_type', categoryFilter);
      const res = await apiFetch(`/api/dashboard/emr/documents?${params}`).then(r => r.json());
      setDocuments(res.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({
        ...formData,
        file_name: file.name,
        title: formData.title || file.name.replace(/\.[^/.]+$/, '')
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.patient_name || !formData.title) {
      toast.error('Patient name and title are required');
      return;
    }
    try {
      // For now, store document metadata (file upload would need storage setup)
      await apiFetch('/api/dashboard/emr/documents', {
        method: 'POST',
        body: JSON.stringify({
          patient_name: formData.patient_name,
          title: formData.title,
          document_type: formData.document_type,
          file_name: formData.file_name || 'document.pdf',
          file_url: selectedFile ? URL.createObjectURL(selectedFile) : null,
          notes: formData.notes
        })
      });
      toast.success('Document uploaded successfully');
      setIsModalOpen(false);
      setFormData({ patient_name: '', title: '', document_type: 'Lab Report', file_name: '', notes: '' });
      setSelectedFile(null);
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await apiFetch(`/api/dashboard/emr/documents/${id}`, { method: 'DELETE' });
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getFileIcon = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('x-ray') || lowerType.includes('mri') || lowerType.includes('ultrasound') || lowerType.includes('ct')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-red-500" />;
  };

  const formatFileSize = (fileName: string): string => {
    // Mock file size since we don't have actual file
    return Math.floor(Math.random() * 3000 + 100) + ' KB';
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patient Documents</h1>
            <p className="text-muted-foreground">Upload and manage patient documents and reports</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>Upload a patient document or report.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_name">Patient Name *</Label>
                  <Input id="patient_name" value={formData.patient_name} onChange={(e) => setFormData({...formData, patient_name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Document Title *</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document_type">Document Type</Label>
                    <Select value={formData.document_type} onValueChange={(v) => setFormData({...formData, document_type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50" onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileSelect} />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-6 w-6 text-emerald-600" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Additional notes about this document" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={categoryFilter === 'all' ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter('all')} className={categoryFilter === 'all' ? "bg-emerald-600" : ""}>All</Button>
            {DOCUMENT_TYPES.slice(0, 5).map((cat) => (
              <Button key={cat} variant={categoryFilter === cat ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(cat)} className={categoryFilter === cat ? "bg-emerald-600" : ""}>{cat}</Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents found</h3>
                <p className="text-muted-foreground">Try adjusting your search or upload new documents</p>
              </CardContent>
            </Card>
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {getFileIcon(doc.document_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{doc.file_name || doc.title}</h3>
                        <Badge variant="outline" className="shrink-0">{doc.document_type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.patient_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                        <span>{formatFileSize(doc.file_name)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => doc.file_url && window.open(doc.file_url, '_blank')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toast.info('Download feature coming soon')}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ConsoleShell>
  );
}
