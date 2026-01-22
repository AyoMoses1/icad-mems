"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, MoreHorizontal, Building2 } from "lucide-react";
import { toast } from "sonner";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageHeader,
  DataTable,
  DataTableColumn,
  ConfirmDialog,
} from "@/components/shared";
import {
  InstitutionDto,
  getInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} from "@/lib/services/institutions";
import { formatDate } from "@/lib/utils";
import { useUIStore } from "@/store";

export default function InstitutionsPage() {
  const { userType } = useUIStore();
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] =
    useState<InstitutionDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    institutionType: "",
    nimasaAccreditationNo: "",
    accreditationExpiry: "",
    physicalAddress: "",
    email: "",
    isActive: true,
    authUserId: "",
  });

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    setIsLoading(true);
    try {
      const result = await getInstitutions({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });

      const allInstitutions = result.items || [];
      setInstitutions(allInstitutions);
      console.log(
        `✅ Loaded ${allInstitutions.length} institutions from /seafarer/api/v1/Accreditation/institutions`,
      );
    } catch (error: any) {
      console.error("❌ Failed to load institutions:", error);
      toast.error(error.message || "Failed to load institutions");
      setInstitutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      institutionType: "",
      nimasaAccreditationNo: "",
      accreditationExpiry: "",
      physicalAddress: "",
      email: "",
      isActive: true,
      authUserId: "",
    });
    setSelectedInstitution(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (institution: InstitutionDto) => {
    setFormData({
      name: institution.name || "",
      institutionType: institution.institutionType || "",
      nimasaAccreditationNo: institution.nimasaAccreditationNo || "",
      accreditationExpiry: institution.accreditationExpiry || "",
      physicalAddress: institution.physicalAddress || "",
      email: institution.email || "",
      isActive: institution.isActive ?? true,
      authUserId: institution.authUserId || "",
    });
    setSelectedInstitution(institution);
    setIsEditOpen(true);
  };

  const handleDelete = (institution: InstitutionDto) => {
    setSelectedInstitution(institution);
    setIsDeleteOpen(true);
  };

  const handleSubmitCreate = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        institutionType: formData.institutionType || undefined,
        nimasaAccreditationNo: formData.nimasaAccreditationNo.trim(),
        accreditationExpiry: formData.accreditationExpiry || undefined,
        physicalAddress: formData.physicalAddress.trim() || undefined,
        email: formData.email.trim() || undefined,
        isActive: formData.isActive,
        authUserId: formData.authUserId?.trim() || undefined,
      };

      if (!payload.name) {
        toast.error("Institution name is required");
        setIsSubmitting(false);
        return;
      }

      if (!payload.nimasaAccreditationNo) {
        toast.error("NIMASA Accreditation No is required");
        setIsSubmitting(false);
        return;
      }

      if (!payload.institutionType) {
        toast.error("Institution type is required");
        setIsSubmitting(false);
        return;
      }

      await createInstitution(payload);
      toast.success("Institution created successfully");
      setIsCreateOpen(false);
      loadInstitutions();
    } catch (error: any) {
      toast.error(error.message || "Failed to create institution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedInstitution) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        institutionType: formData.institutionType || undefined,
        nimasaAccreditationNo: formData.nimasaAccreditationNo.trim(),
        accreditationExpiry: formData.accreditationExpiry || undefined,
        physicalAddress: formData.physicalAddress.trim() || undefined,
        email: formData.email.trim() || undefined,
        isActive: formData.isActive,
        authUserId: formData.authUserId?.trim() || undefined,
      };

      if (!payload.name) {
        toast.error("Institution name is required");
        setIsSubmitting(false);
        return;
      }

      if (!payload.nimasaAccreditationNo) {
        toast.error("NIMASA Accreditation No is required");
        setIsSubmitting(false);
        return;
      }

      if (!payload.institutionType) {
        toast.error("Institution type is required");
        setIsSubmitting(false);
        return;
      }

      await updateInstitution(selectedInstitution.id, payload);
      toast.success("Institution updated successfully");
      setIsEditOpen(false);
      loadInstitutions();
    } catch (error: any) {
      toast.error(error.message || "Failed to update institution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedInstitution) return;

    setIsSubmitting(true);
    try {
      await deleteInstitution(selectedInstitution.id);
      toast.success("Institution deleted successfully");
      setIsDeleteOpen(false);
      loadInstitutions();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete institution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<InstitutionDto>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "accreditedInstitutionName",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.accreditedInstitutionName || row.name || "-"}
        </div>
      ),
    },
    {
      id: "institutionType",
      header: "Type",
      accessorKey: "institutionTypeDescription",
      cell: ({ row }) => (
        <div>{row.institutionTypeDescription || row.institutionType || "-"}</div>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "accreditedInstitutionEmail",
      cell: ({ row }) => (
        <div>{row.accreditedInstitutionEmail || row.email || "-"}</div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessorKey: "accreditedInstitutionPhone",
      cell: ({ row }) => <div>{row.accreditedInstitutionPhone || "-"}</div>,
    },
    {
      id: "address",
      header: "Address",
      accessorKey: "accreditedInstitutionAddress",
      cell: ({ row }) => (
        <div className="max-w-md truncate">
          {row.accreditedInstitutionAddress || row.physicalAddress || "-"}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "accreditationStatus",
      cell: ({ row }) => {
        const status = row.accreditationStatus || (row.isApproved ? "APPROVED" : "PENDING");
        return (
          <Badge variant={status === "APPROVED" || row.isApproved ? "success" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "expiryDate",
      header: "Expiry Date",
      accessorKey: "expiryDate",
      cell: ({ row }) => (
        <div>{row.expiryDate ? formatDate(row.expiryDate) : "-"}</div>
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
        title="Institutions"
        description="Manage training and medical institutions"
        actions={
          userType !== "institution" ? (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Institution
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={institutions}
        isLoading={isLoading}
        emptyMessage="No institutions found"
        emptyDescription="Get started by adding your first institution."
        searchPlaceholder="Search institutions..."
        getRowId={(row) => row.accreditedInstitutionsId || row.id || ""}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Institution</DialogTitle>
            <DialogDescription>
              Create a new institution record.
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
                placeholder="Institution name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institutionType">Institution Type</Label>
                <Select
                  value={formData.institutionType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, institutionType: value })
                  }
                >
                  <SelectTrigger id="institutionType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="training">MTI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nimasaAccreditationNo">
                NIMASA Accreditation No
              </Label>
              <Input
                id="nimasaAccreditationNo"
                value={formData.nimasaAccreditationNo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nimasaAccreditationNo: e.target.value,
                  })
                }
                placeholder="Accreditation number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accreditationExpiry">Accreditation Expiry</Label>
              <Input
                id="accreditationExpiry"
                type="date"
                value={formData.accreditationExpiry}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accreditationExpiry: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physicalAddress">Physical Address</Label>
              <Textarea
                id="physicalAddress"
                value={formData.physicalAddress}
                onChange={(e) =>
                  setFormData({ ...formData, physicalAddress: e.target.value })
                }
                placeholder="Address"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked === true })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
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
            <DialogTitle>Edit Institution</DialogTitle>
            <DialogDescription>
              Update the institution information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Institution name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-institutionType">Institution Type</Label>
                <Select
                  value={formData.institutionType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, institutionType: value })
                  }
                >
                  <SelectTrigger id="edit-institutionType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="training">MTI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nimasaAccreditationNo">
                NIMASA Accreditation No
              </Label>
              <Input
                id="edit-nimasaAccreditationNo"
                value={formData.nimasaAccreditationNo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nimasaAccreditationNo: e.target.value,
                  })
                }
                placeholder="Accreditation number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-accreditationExpiry">
                Accreditation Expiry
              </Label>
              <Input
                id="edit-accreditationExpiry"
                type="date"
                value={formData.accreditationExpiry}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accreditationExpiry: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-physicalAddress">Physical Address</Label>
              <Textarea
                id="edit-physicalAddress"
                value={formData.physicalAddress}
                onChange={(e) =>
                  setFormData({ ...formData, physicalAddress: e.target.value })
                }
                placeholder="Address"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked === true })
                }
              />
              <Label htmlFor="edit-isActive" className="cursor-pointer">
                Active
              </Label>
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
        title="Delete Institution"
        description={`Are you sure you want to delete "${selectedInstitution?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}
