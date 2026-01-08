"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  PageHeader,
  DataTable,
  DataTableColumn,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState,
} from "@/components/shared";
import {
  getOnboardingRequirements,
  createOnboardingRequirement,
  updateOnboardingRequirement,
  deleteOnboardingRequirement,
  type OnboardingRequirementDto,
  type CreateOnboardingRequirementRequest,
} from "@/lib/services/onboarding-requirements-service";
import {
  getDocumentMasters,
  type DocumentMasterDto,
} from "@/lib/services/documents-master-service";

const USER_TYPES = ["Seafarer", "MTI", "Medical"];

export default function OnboardingRequirementsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirements, setRequirements] = useState<OnboardingRequirementDto[]>(
    []
  );
  const [documentMasters, setDocumentMasters] = useState<DocumentMasterDto[]>(
    []
  );
  const [selectedUserType, setSelectedUserType] = useState<string>("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] =
    useState<OnboardingRequirementDto | null>(null);
  const [formData, setFormData] = useState<CreateOnboardingRequirementRequest>(
    {
      userType: null,
      documentMasterId: "",
      isMandatory: false,
    }
  );

  const loadRequirements = async () => {
    setIsLoading(true);
    try {
      const userType =
        selectedUserType === "All" ? undefined : selectedUserType;
      const response = await getOnboardingRequirements({ userType });
      const ok = response.success ?? (response as any).successful;
      if ((ok || response.data) && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setRequirements(data);
      } else {
        toast.error(response.message || "Failed to load requirements");
      }
    } catch (error: any) {
      console.error("Error loading requirements:", error);
      toast.error(error?.message || "Failed to load requirements");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocumentMasters = async () => {
    try {
      const allDocuments: DocumentMasterDto[] = [];
      let pageNumber = 1;
      const pageSize = 100;
      let hasMore = true;

      // Fetch all pages of documents
      while (hasMore) {
        const response = await getDocumentMasters({
          pageNumber,
          pageSize,
        });
        const ok = response.success ?? (response as any).successful;
        if ((ok || response.data) && response.data) {
          const items = response.data.items || [];
          allDocuments.push(...items);
          
          // Check if there are more pages
          const totalPages = Math.ceil(
            (response.data.totalNumber || 0) / pageSize
          );
          hasMore = pageNumber < totalPages && items.length === pageSize;
          pageNumber++;
        } else {
          hasMore = false;
        }
      }

      setDocumentMasters(allDocuments);
    } catch (error: any) {
      console.error("Error loading document masters:", error);
      toast.error("Failed to load documents");
    }
  };

  useEffect(() => {
    loadRequirements();
    loadDocumentMasters();
  }, [selectedUserType]);

  const handleCreate = async () => {
    if (!formData.documentMasterId) {
      toast.error("Please select a document");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createOnboardingRequirement(formData);
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Requirement created successfully");
        setIsCreateModalOpen(false);
        setFormData({
          userType: null,
          documentMasterId: "",
          isMandatory: false,
        });
        await loadRequirements();
      } else {
        toast.error(response.message || "Failed to create requirement");
      }
    } catch (error: any) {
      console.error("Error creating requirement:", error);
      toast.error(error?.message || "Failed to create requirement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedRequirement || !formData.documentMasterId) {
      toast.error("Please select a document");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateOnboardingRequirement(
        selectedRequirement.id,
        formData
      );
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Requirement updated successfully");
        setIsEditModalOpen(false);
        setSelectedRequirement(null);
        setFormData({
          userType: null,
          documentMasterId: "",
          isMandatory: false,
        });
        await loadRequirements();
      } else {
        toast.error(response.message || "Failed to update requirement");
      }
    } catch (error: any) {
      console.error("Error updating requirement:", error);
      toast.error(error?.message || "Failed to update requirement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequirement) return;

    setIsSubmitting(true);
    try {
      const response = await deleteOnboardingRequirement(selectedRequirement.id);
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Requirement deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedRequirement(null);
        await loadRequirements();
      } else {
        toast.error(response.message || "Failed to delete requirement");
      }
    } catch (error: any) {
      console.error("Error deleting requirement:", error);
      toast.error(error?.message || "Failed to delete requirement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (requirement: OnboardingRequirementDto) => {
    setSelectedRequirement(requirement);
    setFormData({
      userType: requirement.userType || null,
      documentMasterId: requirement.documentMasterId,
      isMandatory: requirement.isMandatory ?? false,
    });
    setIsEditModalOpen(true);
  };

  const handleView = (requirement: OnboardingRequirementDto) => {
    setSelectedRequirement(requirement);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (requirement: OnboardingRequirementDto) => {
    setSelectedRequirement(requirement);
    setIsDeleteDialogOpen(true);
  };

  const getDocumentName = (documentMasterId: string) => {
    const doc = documentMasters.find((d) => d.id === documentMasterId);
    return doc?.name || documentMasterId;
  };

  const columns: DataTableColumn<OnboardingRequirementDto>[] = [
    {
      id: "userType",
      header: "User Type",
      cell: ({ row }) => (
        <Badge variant={row.userType ? "default" : "secondary"}>
          {row.userType || "All"}
        </Badge>
      ),
    },
    {
      id: "documentName",
      header: "Document Name",
      cell: ({ row }) => (
        <div className="font-medium">
          {getDocumentName(row.documentMasterId)}
        </div>
      ),
    },
    {
      id: "categoryType",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.categoryType || "N/A"}
        </div>
      ),
    },
    {
      id: "isMandatory",
      header: "Mandatory",
      cell: ({ row }) => (
        <Badge variant={row.isMandatory ? "destructive" : "secondary"}>
          {row.isMandatory ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleView(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding Requirements"
        description="Manage onboarding requirements for different user types"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Requirement
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="userTypeFilter">Filter by User Type:</Label>
          <Select value={selectedUserType} onValueChange={setSelectedUserType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {USER_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Requirement
        </Button>
      </div>

      {requirements.length === 0 ? (
        <EmptyState
          title="No requirements found"
          description="Get started by creating a new requirement"
          action={{
            label: "Add Requirement",
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <DataTable columns={columns} data={requirements} />
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Onboarding Requirement</DialogTitle>
            <DialogDescription>
              Add a new requirement for user onboarding
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select
                value={formData.userType || "all"}
                onValueChange={(value) =>
                  setFormData({ ...formData, userType: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {USER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="documentMasterId">Document Master *</Label>
              <Select
                value={formData.documentMasterId}
                onValueChange={(value) =>
                  setFormData({ ...formData, documentMasterId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document" />
                </SelectTrigger>
                <SelectContent>
                  {documentMasters.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name} {doc.categoryType && `(${doc.categoryType})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isMandatory"
                checked={formData.isMandatory || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isMandatory: checked })
                }
              />
              <Label htmlFor="isMandatory">Is Mandatory</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData({
                  userType: null,
                  documentMasterId: "",
                  isMandatory: false,
                });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Onboarding Requirement</DialogTitle>
            <DialogDescription>
              Update the requirement details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editUserType">User Type</Label>
              <Select
                value={formData.userType || "all"}
                onValueChange={(value) =>
                  setFormData({ ...formData, userType: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {USER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editDocumentMasterId">Document Master *</Label>
              <Select
                value={formData.documentMasterId}
                onValueChange={(value) =>
                  setFormData({ ...formData, documentMasterId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document" />
                </SelectTrigger>
                <SelectContent>
                  {documentMasters.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name} {doc.categoryType && `(${doc.categoryType})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editIsMandatory"
                checked={formData.isMandatory || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isMandatory: checked })
                }
              />
              <Label htmlFor="editIsMandatory">Is Mandatory</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedRequirement(null);
                setFormData({
                  userType: null,
                  documentMasterId: "",
                  isMandatory: false,
                });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Onboarding Requirement</DialogTitle>
            <DialogDescription>Requirement details</DialogDescription>
          </DialogHeader>
          {selectedRequirement && (
            <div className="space-y-4">
              <div>
                <Label>User Type</Label>
                <div className="mt-1">
                  <Badge variant="default">
                    {selectedRequirement.userType || "All"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Document Name</Label>
                <div className="mt-1 font-medium">
                  {getDocumentName(selectedRequirement.documentMasterId)}
                </div>
              </div>
              <div>
                <Label>Category Type</Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedRequirement.categoryType || "N/A"}
                </div>
              </div>
              <div>
                <Label>Is Mandatory</Label>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedRequirement.isMandatory ? "destructive" : "secondary"
                    }
                  >
                    {selectedRequirement.isMandatory ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Requirement"
        description={`Are you sure you want to delete this requirement for ${selectedRequirement ? getDocumentName(selectedRequirement.documentMasterId) : ""}?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}

