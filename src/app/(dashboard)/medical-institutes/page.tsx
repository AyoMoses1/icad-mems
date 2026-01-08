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
  MedicalInstituteDto,
  getMedicalInstitutes,
  createMedicalInstitute,
  updateMedicalInstitute,
  deleteMedicalInstitute,
} from "@/lib/services/medical-institutes-service";
import { getInstitutions, InstitutionDto } from "@/lib/services/institutions";
import { formatDate } from "@/lib/utils";
import { useUIStore } from "@/store";

export default function MedicalInstitutesPage() {
  const { userType } = useUIStore();
  const [medicalInstitutes, setMedicalInstitutes] = useState<
    MedicalInstituteDto[]
  >([]);
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMedicalInstitute, setSelectedMedicalInstitute] =
    useState<MedicalInstituteDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    institutionId: "",
    clinicLicenseNo: "",
    numApprovedDoctors: 0,
    laboratoryEquipped: false,
  });

  useEffect(() => {
    loadMedicalInstitutes();
    loadInstitutions();
  }, []);

  const loadMedicalInstitutes = async () => {
    setIsLoading(true);
    try {
      // Fetch first page
      const firstPage = await getMedicalInstitutes({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });

      let allMedicalInstitutes = firstPage.items || [];

      // If there are more pages, fetch them all
      if (firstPage.totalNumber > firstPage.items.length) {
        const totalPages = Math.ceil(firstPage.totalNumber / 100);
        const remainingPages = [];

        for (let page = 2; page <= totalPages; page++) {
          remainingPages.push(
            getMedicalInstitutes({
              pageNumber: page,
              pageSize: 100,
              sortDirection: "asc",
            }),
          );
        }

        const results = await Promise.all(remainingPages);
        allMedicalInstitutes = [
          ...allMedicalInstitutes,
          ...results.flatMap((r) => r.items || []),
        ];
      }

      setMedicalInstitutes(allMedicalInstitutes);
    } catch (error) {
      console.error("Failed to load medical institutes:", error);
      toast.error("Failed to load medical institutes");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInstitutions = async () => {
    try {
      const firstPage = await getInstitutions({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });

      let allInstitutions = firstPage.items || [];

      if (firstPage.totalNumber > firstPage.items.length) {
        const totalPages = Math.ceil(firstPage.totalNumber / 100);
        const remainingPages = [];

        for (let page = 2; page <= totalPages; page++) {
          remainingPages.push(
            getInstitutions({
              pageNumber: page,
              pageSize: 100,
              sortDirection: "asc",
            }),
          );
        }

        const results = await Promise.all(remainingPages);
        allInstitutions = [
          ...allInstitutions,
          ...results.flatMap((r) => r.items || []),
        ];
      }

      console.log("Loaded institutions:", allInstitutions);
      console.log(
        "Medical institutions:",
        allInstitutions.filter((inst) => inst.institutionType === "Medical"),
      );
      setInstitutions(allInstitutions);
    } catch (error) {
      console.error("Failed to load institutions:", error);
      toast.error("Failed to load institutions");
    }
  };

  const getInstitutionName = (institutionId: string) => {
    const institution = institutions.find((inst) => inst.id === institutionId);
    return institution?.name || institutionId;
  };

  const handleCreate = () => {
    setFormData({
      institutionId: "",
      clinicLicenseNo: "",
      numApprovedDoctors: 0,
      laboratoryEquipped: false,
    });
    setSelectedMedicalInstitute(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (medicalInstitute: MedicalInstituteDto) => {
    setFormData({
      institutionId: medicalInstitute.institutionId,
      clinicLicenseNo: medicalInstitute.clinicLicenseNo || "",
      numApprovedDoctors: medicalInstitute.numApprovedDoctors || 0,
      laboratoryEquipped: medicalInstitute.laboratoryEquipped || false,
    });
    setSelectedMedicalInstitute(medicalInstitute);
    setIsEditOpen(true);
  };

  const handleDelete = (medicalInstitute: MedicalInstituteDto) => {
    setSelectedMedicalInstitute(medicalInstitute);
    setIsDeleteOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.institutionId) {
      toast.error("Institution is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        institutionId: formData.institutionId.trim(),
        clinicLicenseNo: formData.clinicLicenseNo.trim() || undefined,
        numApprovedDoctors:
          formData.numApprovedDoctors > 0
            ? formData.numApprovedDoctors
            : undefined,
        laboratoryEquipped: formData.laboratoryEquipped || undefined,
      };

      await createMedicalInstitute(payload);
      toast.success("Medical institute created successfully");
      setIsCreateOpen(false);
      loadMedicalInstitutes();
    } catch (error: any) {
      toast.error(error.message || "Failed to create medical institute");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedMedicalInstitute) return;

    setIsSubmitting(true);
    try {
      const payload = {
        clinicLicenseNo: formData.clinicLicenseNo.trim() || undefined,
        numApprovedDoctors:
          formData.numApprovedDoctors > 0
            ? formData.numApprovedDoctors
            : undefined,
        laboratoryEquipped: formData.laboratoryEquipped || undefined,
      };

      await updateMedicalInstitute(
        selectedMedicalInstitute.institutionId,
        payload,
      );
      toast.success("Medical institute updated successfully");
      setIsEditOpen(false);
      loadMedicalInstitutes();
    } catch (error: any) {
      toast.error(error.message || "Failed to update medical institute");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedicalInstitute) return;

    setIsSubmitting(true);
    try {
      await deleteMedicalInstitute(selectedMedicalInstitute.institutionId);
      toast.success("Medical institute deleted successfully");
      setIsDeleteOpen(false);
      loadMedicalInstitutes();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete medical institute");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<MedicalInstituteDto>[] = [
    {
      id: "institution",
      header: "Institution",
      accessorKey: "institutionId",
      cell: ({ row }) => (
        <div className="font-medium">
          {getInstitutionName(row.institutionId)}
        </div>
      ),
    },
    {
      id: "clinicLicenseNo",
      header: "Clinic License No",
      accessorKey: "clinicLicenseNo",
      cell: ({ row }) => <div>{row.clinicLicenseNo || "-"}</div>,
    },
    {
      id: "numApprovedDoctors",
      header: "Approved Doctors",
      accessorKey: "numApprovedDoctors",
      cell: ({ row }) => <div>{row.numApprovedDoctors ?? "-"}</div>,
    },
    {
      id: "laboratoryEquipped",
      header: "Laboratory Equipped",
      accessorKey: "laboratoryEquipped",
      cell: ({ row }) => (
        <Badge variant={row.laboratoryEquipped ? "default" : "secondary"}>
          {row.laboratoryEquipped ? "Yes" : "No"}
        </Badge>
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
        title="Medical Institutes"
        description="Manage medical institutes and their details"
        actions={
          userType !== "institution" ? (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medical Institute
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={medicalInstitutes}
        isLoading={isLoading}
        emptyMessage="No medical institutes found"
        emptyDescription="Get started by adding your first medical institute."
        searchPlaceholder="Search medical institutes..."
        getRowId={(row) => row.institutionId}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Medical Institute</DialogTitle>
            <DialogDescription>
              Create a new medical institute record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="institutionId">Institution *</Label>
              <Select
                value={formData.institutionId}
                onValueChange={(value) =>
                  setFormData({ ...formData, institutionId: value })
                }
              >
                <SelectTrigger id="institutionId">
                  <SelectValue placeholder="Select an institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading institutions...
                    </SelectItem>
                  ) : (
                    institutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name || inst.id}
                        {inst.institutionType
                          ? ` (${inst.institutionType})`
                          : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicLicenseNo">Clinic License No</Label>
              <Input
                id="clinicLicenseNo"
                value={formData.clinicLicenseNo}
                onChange={(e) =>
                  setFormData({ ...formData, clinicLicenseNo: e.target.value })
                }
                placeholder="Enter clinic license number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numApprovedDoctors">
                Number of Approved Doctors
              </Label>
              <Input
                id="numApprovedDoctors"
                type="number"
                min="0"
                value={formData.numApprovedDoctors}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numApprovedDoctors: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter number of approved doctors"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="laboratoryEquipped"
                checked={formData.laboratoryEquipped}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    laboratoryEquipped: checked === true,
                  })
                }
              />
              <Label
                htmlFor="laboratoryEquipped"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Laboratory Equipped
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
            <DialogTitle>Edit Medical Institute</DialogTitle>
            <DialogDescription>
              Update the medical institute information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-institutionId">Institution</Label>
              <Input
                id="edit-institutionId"
                value={getInstitutionName(formData.institutionId)}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-clinicLicenseNo">Clinic License No</Label>
              <Input
                id="edit-clinicLicenseNo"
                value={formData.clinicLicenseNo}
                onChange={(e) =>
                  setFormData({ ...formData, clinicLicenseNo: e.target.value })
                }
                placeholder="Enter clinic license number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-numApprovedDoctors">
                Number of Approved Doctors
              </Label>
              <Input
                id="edit-numApprovedDoctors"
                type="number"
                min="0"
                value={formData.numApprovedDoctors}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numApprovedDoctors: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter number of approved doctors"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-laboratoryEquipped"
                checked={formData.laboratoryEquipped}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    laboratoryEquipped: checked === true,
                  })
                }
              />
              <Label
                htmlFor="edit-laboratoryEquipped"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Laboratory Equipped
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
        title="Delete Medical Institute"
        description={`Are you sure you want to delete this medical institute? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}
