"use client";

import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  MoreHorizontal,
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
  getDocumentTypes,
  type DocumentTypeDto,
} from "@/lib/services/lookup-service";
import { formatDate } from "@/lib/utils";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentTypeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentTypeDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await getDocumentTypes();
      if (response.success ?? (response as any).successful) {
        const items = Array.isArray(response.data) ? response.data : [];
        setDocuments(items);
      } else {
        toast.error(response.message || "Failed to load documents");
      }
    } catch (error: any) {
      console.error("Failed to load documents:", error);
      toast.error(error.message || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      description: "",
    });
    setSelectedDocument(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (document: DocumentTypeDto) => {
    setFormData({
      description: document.description || "",
    });
    setSelectedDocument(document);
    setIsEditOpen(true);
  };

  const handleDelete = (document: DocumentTypeDto) => {
    setSelectedDocument(document);
    setIsDeleteOpen(true);
  };

  const handleSubmitCreate = async () => {
    toast.info("Document types are managed by the system. Please contact an administrator to add new document types.");
    setIsCreateOpen(false);
  };

  const handleSubmitEdit = async () => {
    toast.info("Document types are managed by the system. Please contact an administrator to modify document types.");
    setIsEditOpen(false);
  };

  const handleConfirmDelete = async () => {
    toast.info("Document types are managed by the system. Please contact an administrator to delete document types.");
    setIsDeleteOpen(false);
  };

  const columns: DataTableColumn<DocumentTypeDto>[] = [
    {
      id: "documentTypesId",
      header: "ID",
      accessorKey: "documentTypesId",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.documentTypesId || "-"}</div>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      cell: ({ row }) => (
        <div className="font-medium">{row.description || "-"}</div>
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
            <DropdownMenuItem disabled>
              <Pencil className="mr-2 h-4 w-4" />
              Edit (System Managed)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete (System Managed)
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
        title="Document Types"
        description="View available document types in the system"
      />

      <DataTable
        columns={columns}
        data={documents}
        isLoading={isLoading}
        emptyMessage="No document types found"
        emptyDescription="Document types are managed by the system."
        searchPlaceholder="Search documents..."
        getRowId={(row) => row.documentTypesId}
      />

    </div>
  );
}

