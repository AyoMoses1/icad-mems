"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Award,
  DollarSign,
  FileText,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CertificateDto,
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getCertificateRequirements,
  getCertificateFees,
} from "@/lib/services/certificates-service";
import { formatDate } from "@/lib/utils";

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    stcwCode: "",
    description: "",
    certType: "",
    rankLevel: "",
    tonnageLimit: "",
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setIsLoading(true);
    try {
      const response = await getCertificates({ pageNumber: 1, pageSize: 100 });
      if (response.success ?? (response as any).successful) {
        setCertificates(response.data?.items || []);
      } else {
        toast.error("Failed to load certificates");
      }
    } catch (error) {
      console.error("Failed to load certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      stcwCode: "",
      description: "",
      certType: "",
      rankLevel: "",
      tonnageLimit: "",
    });
    setSelectedCertificate(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (certificate: CertificateDto) => {
    setFormData({
      name: certificate.name || "",
      stcwCode: certificate.stcwCode || "",
      description: certificate.description || "",
      certType: certificate.certType || "",
      rankLevel: certificate.rankLevel || "",
      tonnageLimit: certificate.tonnageLimit || "",
    });
    setSelectedCertificate(certificate);
    setIsEditOpen(true);
  };

  const handleDelete = (certificate: CertificateDto) => {
    setSelectedCertificate(certificate);
    setIsDeleteOpen(true);
  };

  const handleViewDetails = (certificate: CertificateDto) => {
    router.push(`/certificates/${certificate.id}`);
  };

  const handleViewRequirements = (certificate: CertificateDto) => {
    router.push(`/certificates/${certificate.id}?tab=requirements`);
  };

  const handleViewFees = (certificate: CertificateDto) => {
    router.push(`/certificates/${certificate.id}?tab=fees`);
  };

  const handleSubmitCreate = async () => {
    setIsSubmitting(true);
    try {
      const response = await createCertificate({
        name: formData.name.trim() || undefined,
        stcwCode: formData.stcwCode.trim() || undefined,
        description: formData.description.trim() || undefined,
        certType: formData.certType.trim() || undefined,
        rankLevel: formData.rankLevel.trim() || undefined,
        tonnageLimit: formData.tonnageLimit.trim() || undefined,
      });
      if (response.success ?? (response as any).successful) {
        toast.success("Certificate created successfully");
        setIsCreateOpen(false);
        loadCertificates();
      } else {
        toast.error("Failed to create certificate");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedCertificate) return;

    setIsSubmitting(true);
    try {
      const response = await updateCertificate(selectedCertificate.id, {
        name: formData.name.trim() || undefined,
        stcwCode: formData.stcwCode.trim() || undefined,
        description: formData.description.trim() || undefined,
        certType: formData.certType.trim() || undefined,
        rankLevel: formData.rankLevel.trim() || undefined,
        tonnageLimit: formData.tonnageLimit.trim() || undefined,
      });
      if (response.success ?? (response as any).successful) {
        toast.success("Certificate updated successfully");
        setIsEditOpen(false);
        loadCertificates();
      } else {
        toast.error("Failed to update certificate");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCertificate) return;

    setIsSubmitting(true);
    try {
      const response = await deleteCertificate(selectedCertificate.id);
      if (response.success ?? (response as any).successful) {
        toast.success("Certificate deleted successfully");
        setIsDeleteOpen(false);
        loadCertificates();
      } else {
        toast.error("Failed to delete certificate");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<CertificateDto>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.name ?? "-"}</div>
      ),
    },
    {
      id: "stcwCode",
      header: "STCW Code",
      accessorKey: "stcwCode",
      cell: ({ row }) => <div>{row.stcwCode ?? "-"}</div>,
    },
    {
      id: "categoryType",
      header: "Category",
      accessorKey: "categoryType",
      cell: ({ row }) => (
        <Badge variant="outline">{row.categoryType ?? "-"}</Badge>
      ),
    },
    {
      id: "certType",
      header: "Type",
      accessorKey: "certType",
      cell: ({ row }) => <div>{row.certType ?? "-"}</div>,
    },
    {
      id: "fees",
      header: "Fees",
      accessorKey: "fees",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.fees?.length || 0} fee(s)
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.createdAt ? formatDate(row.createdAt) : "-"}
        </div>
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
            <DropdownMenuItem onClick={() => handleViewDetails(row)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewRequirements(row)}>
              <FileText className="mr-2 h-4 w-4" />
              View Requirements
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewFees(row)}>
              <DollarSign className="mr-2 h-4 w-4" />
              View Fees
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
        title="Certificates"
        description="Manage certificates and their requirements"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Certificate
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={certificates}
        isLoading={isLoading}
        emptyMessage="No certificates found"
        emptyDescription="Get started by adding your first certificate."
        searchPlaceholder="Search certificates..."
        getRowId={(row) => row.id}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Certificate</DialogTitle>
            <DialogDescription>
              Create a new certificate record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Certificate name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="certType">Certificate Type</Label>
                <Input
                  id="certType"
                  value={formData.certType}
                  onChange={(e) =>
                    setFormData({ ...formData, certType: e.target.value })
                  }
                  placeholder="Certificate type"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rankLevel">Rank Level</Label>
                <Input
                  id="rankLevel"
                  value={formData.rankLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, rankLevel: e.target.value })
                  }
                  placeholder="Rank level"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tonnageLimit">Tonnage Limit</Label>
                <Input
                  id="tonnageLimit"
                  value={formData.tonnageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, tonnageLimit: e.target.value })
                  }
                  placeholder="Tonnage limit"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Certificate description"
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Certificate</DialogTitle>
            <DialogDescription>
              Update the certificate information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Certificate name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="edit-certType">Certificate Type</Label>
                <Input
                  id="edit-certType"
                  value={formData.certType}
                  onChange={(e) =>
                    setFormData({ ...formData, certType: e.target.value })
                  }
                  placeholder="Certificate type"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rankLevel">Rank Level</Label>
                <Input
                  id="edit-rankLevel"
                  value={formData.rankLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, rankLevel: e.target.value })
                  }
                  placeholder="Rank level"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tonnageLimit">Tonnage Limit</Label>
                <Input
                  id="edit-tonnageLimit"
                  value={formData.tonnageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, tonnageLimit: e.target.value })
                  }
                  placeholder="Tonnage limit"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Certificate description"
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
        title="Delete Certificate"
        description={`Are you sure you want to delete "${selectedCertificate?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}

