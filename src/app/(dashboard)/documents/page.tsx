"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PageHeader,
  DataTable,
  DataTableColumn,
  ConfirmDialog,
} from "@/components/shared";
import {
  DocumentMasterDto,
  getDocumentMasters,
  createDocumentMaster,
  updateDocumentMaster,
  deleteDocumentMaster,
} from "@/lib/services/documents-master-service";
import { formatDate } from "@/lib/utils";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentMasterDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMasterDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    categoryType: "",
    stcwCode: "",
    description: "",
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await getDocumentMasters({ pageNumber: 1, pageSize: 100 });
      if (response.success ?? (response as any).successful) {
        setDocuments(response.data?.items || []);
      } else {
        toast.error("Failed to load documents");
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      categoryType: "",
      stcwCode: "",
      description: "",
    });
    setSelectedDocument(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (document: DocumentMasterDto) => {
    setFormData({
      name: document.name || "",
      categoryType: document.categoryType || "",
      stcwCode: document.stcwCode || "",
      description: document.description || "",
    });
    setSelectedDocument(document);
    setIsEditOpen(true);
  };

  const handleDelete = (document: DocumentMasterDto) => {
    setSelectedDocument(document);
    setIsDeleteOpen(true);
  };

  const handleSubmitCreate = async () => {
    setIsSubmitting(true);
    try {
      const response = await createDocumentMaster({
        name: formData.name.trim() || undefined,
        categoryType: formData.categoryType.trim() || undefined,
        stcwCode: formData.stcwCode.trim() || undefined,
        description: formData.description.trim() || undefined,
      });
      if (response.success ?? (response as any).successful) {
        toast.success("Document created successfully");
        setIsCreateOpen(false);
        loadDocuments();
      } else {
        toast.error("Failed to create document");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedDocument) return;

    setIsSubmitting(true);
    try {
      const response = await updateDocumentMaster(selectedDocument.id, {
        name: formData.name.trim() || undefined,
        categoryType: formData.categoryType.trim() || undefined,
        stcwCode: formData.stcwCode.trim() || undefined,
        description: formData.description.trim() || undefined,
      });
      if (response.success ?? (response as any).successful) {
        toast.success("Document updated successfully");
        setIsEditOpen(false);
        loadDocuments();
      } else {
        toast.error("Failed to update document");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocument) return;

    setIsSubmitting(true);
    try {
      const response = await deleteDocumentMaster(selectedDocument.id);
      if (response.success ?? (response as any).successful) {
        toast.success("Document deleted successfully");
        setIsDeleteOpen(false);
        loadDocuments();
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<DocumentMasterDto>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.name || "-"}</div>
      ),
    },
    {
      id: "categoryType",
      header: "Category",
      accessorKey: "categoryType",
      cell: ({ row }) => <div>{row.categoryType || "-"}</div>,
    },
    {
      id: "stcwCode",
      header: "STCW Code",
      accessorKey: "stcwCode",
      cell: ({ row }) => <div>{row.stcwCode || "-"}</div>,
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      cell: ({ row }) => (
        <div className="max-w-md truncate">{row.description || "-"}</div>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div>{row.createdAt ? formatDate(row.createdAt) : "-"}</div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(row)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage document types and master data"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Document
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={documents}
        isLoading={isLoading}
        emptyMessage="No documents found"
        emptyDescription="Get started by adding your first document type."
        searchPlaceholder="Search documents..."
        getRowId={(row) => row.id}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
            <DialogDescription>
              Create a new document type for the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Document name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryType">Category Type</Label>
              <Input
                id="categoryType"
                value={formData.categoryType}
                onChange={(e) =>
                  setFormData({ ...formData, categoryType: e.target.value })
                }
                placeholder="Category type"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stcwCode">STCW Code</Label>
              <Input
                id="stcwCode"
                value={formData.stcwCode}
                onChange={(e) =>
                  setFormData({ ...formData, stcwCode: e.target.value })
                }
                placeholder="STCW code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update the document type information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Document name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-categoryType">Category Type</Label>
              <Input
                id="edit-categoryType"
                value={formData.categoryType}
                onChange={(e) =>
                  setFormData({ ...formData, categoryType: e.target.value })
                }
                placeholder="Category type"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stcwCode">STCW Code</Label>
              <Input
                id="edit-stcwCode"
                value={formData.stcwCode}
                onChange={(e) =>
                  setFormData({ ...formData, stcwCode: e.target.value })
                }
                placeholder="STCW code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        description={`Are you sure you want to delete "${selectedDocument?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}

