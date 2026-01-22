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
import { useCanManageServices } from "@/utils/permissions";
import { requirementListsApi } from "@/lib/services/service-management-api";
import type {
  RequirementListDto,
  CreateRequirementListRequest,
  UpdateRequirementListRequest,
} from "@/types/service-management";
import { getDocumentTypes, type DocumentTypeDto } from "@/lib/services/lookup-service";

interface MetricOption {
  metricId: string;
  description: string;
}

export default function RequirementListsPage() {
  const canManage = useCanManageServices();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirementLists, setRequirementLists] = useState<RequirementListDto[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [metrics, setMetrics] = useState<MetricOption[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequirementList, setSelectedRequirementList] =
    useState<RequirementListDto | null>(null);
  const [formData, setFormData] = useState<CreateRequirementListRequest>({
    description: "",
    metricId: "",
    documentTypesId: null,
    isActive: true,
  });

  const loadRequirementLists = async () => {
    setIsLoading(true);
    try {
      const data = await requirementListsApi.getRequirementLists();
      setRequirementLists(data);
      
      // Extract unique metrics from requirement lists
      const uniqueMetrics = new Map<string, MetricOption>();
      data.forEach((req) => {
        if (!uniqueMetrics.has(req.metricId)) {
          uniqueMetrics.set(req.metricId, {
            metricId: req.metricId,
            description: req.metricDescription,
          });
        }
      });
      setMetrics(Array.from(uniqueMetrics.values()));
    } catch (error: any) {
      console.error("Error loading requirement lists:", error);
      toast.error(error?.message || "Failed to load requirement lists");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const response = await getDocumentTypes();
      if (response.success && response.data) {
        setDocumentTypes(response.data);
      } else {
        const data = Array.isArray(response.data) ? response.data : [];
        setDocumentTypes(data);
      }
    } catch (error: any) {
      console.error("Error loading document types:", error);
      toast.error("Failed to load document types");
    }
  };

  useEffect(() => {
    loadRequirementLists();
    loadDocumentTypes();
  }, []);

  const handleCreate = async () => {
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.metricId) {
      toast.error("Metric is required");
      return;
    }

    // Validate document type is required for File/Document metric
    const selectedMetric = metrics.find((m) => m.metricId === formData.metricId);
    if (selectedMetric?.description === "File/Document" && !formData.documentTypesId) {
      toast.error("Document type is required for File/Document metric");
      return;
    }

    setIsSubmitting(true);
    try {
      await requirementListsApi.createRequirementList(formData);
      toast.success("Requirement list created successfully");
      setIsCreateModalOpen(false);
      setFormData({
        description: "",
        metricId: "",
        documentTypesId: null,
        isActive: true,
      });
      await loadRequirementLists();
    } catch (error: any) {
      console.error("Error creating requirement list:", error);
      toast.error(error?.message || "Failed to create requirement list");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedRequirementList) return;
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.metricId) {
      toast.error("Metric is required");
      return;
    }

    // Validate document type is required for File/Document metric
    const selectedMetric = metrics.find((m) => m.metricId === formData.metricId);
    if (selectedMetric?.description === "File/Document" && !formData.documentTypesId) {
      toast.error("Document type is required for File/Document metric");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateRequest: UpdateRequirementListRequest = {
        description: formData.description,
        metricId: formData.metricId,
        documentTypesId: formData.documentTypesId,
        isActive: formData.isActive ?? true,
      };
      await requirementListsApi.updateRequirementList(
        selectedRequirementList.requirementListId,
        updateRequest
      );
      toast.success("Requirement list updated successfully");
      setIsEditModalOpen(false);
      setSelectedRequirementList(null);
      await loadRequirementLists();
    } catch (error: any) {
      console.error("Error updating requirement list:", error);
      toast.error(error?.message || "Failed to update requirement list");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequirementList) return;

    setIsSubmitting(true);
    try {
      await requirementListsApi.deleteRequirementList(
        selectedRequirementList.requirementListId
      );
      toast.success("Requirement list deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedRequirementList(null);
      await loadRequirementLists();
    } catch (error: any) {
      console.error("Error deleting requirement list:", error);
      toast.error(error?.message || "Failed to delete requirement list");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (requirementList: RequirementListDto) => {
    setSelectedRequirementList(requirementList);
    setFormData({
      description: requirementList.description,
      metricId: requirementList.metricId,
      documentTypesId: requirementList.documentTypesId || null,
      isActive: requirementList.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleView = (requirementList: RequirementListDto) => {
    setSelectedRequirementList(requirementList);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (requirementList: RequirementListDto) => {
    setSelectedRequirementList(requirementList);
    setIsDeleteDialogOpen(true);
  };

  const getDocumentTypeName = (documentTypesId: string | null | undefined) => {
    if (!documentTypesId) return "N/A";
    const docType = documentTypes.find((d) => d.documentTypesId === documentTypesId);
    return docType?.description || documentTypesId;
  };

  const getMetricDescription = (metricId: string) => {
    const metric = metrics.find((m) => m.metricId === metricId);
    return metric?.description || metricId;
  };

  const selectedMetricDescription = formData.metricId
    ? getMetricDescription(formData.metricId)
    : "";

  const columns: DataTableColumn<RequirementListDto>[] = [
    {
      id: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="font-medium">{row.description}</div>
      ),
    },
    {
      id: "metricType",
      header: "Metric Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.metricDescription}</Badge>
      ),
    },
    {
      id: "documentType",
      header: "Document Type",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.documentTypeDescription || "N/A"}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
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
          {canManage && (
            <>
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
            </>
          )}
        </div>
      ),
    },
  ];

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Requirement Lists"
          description="View requirement lists (admin access required to manage)"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            You do not have permission to manage requirement lists.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requirement Lists"
        description="Manage requirement lists for services"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Requirement List
          </Button>
        }
      />

      {requirementLists.length === 0 ? (
        <EmptyState
          title="No requirement lists found"
          description="Get started by creating a new requirement list"
          action={{
            label: "Add Requirement List",
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <DataTable columns={columns} data={requirementLists} />
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Requirement List</DialogTitle>
            <DialogDescription>
              Add a new requirement list for services
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter requirement description"
              />
            </div>
            <div>
              <Label htmlFor="metricId">Metric Type *</Label>
              <Select
                value={formData.metricId}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    metricId: value,
                    // Clear document type if metric changes away from File/Document
                    documentTypesId:
                      metrics.find((m) => m.metricId === value)?.description ===
                      "File/Document"
                        ? formData.documentTypesId
                        : null,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metric type" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.length > 0 ? (
                    metrics.map((metric) => (
                      <SelectItem key={metric.metricId} value={metric.metricId}>
                        {metric.description}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No metrics available. Create a requirement list first.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {metrics.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Note: You need at least one existing requirement list to see
                  available metrics. If this is the first requirement list, you
                  may need to contact an administrator.
                </p>
              )}
            </div>
            {selectedMetricDescription === "File/Document" && (
              <div>
                <Label htmlFor="documentTypesId">Document Type *</Label>
                <Select
                  value={formData.documentTypesId || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, documentTypesId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((docType) => (
                      <SelectItem
                        key={docType.documentTypesId}
                        value={docType.documentTypesId}
                      >
                        {docType.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Is Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData({
                  description: "",
                  metricId: "",
                  documentTypesId: null,
                  isActive: true,
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
            <DialogTitle>Edit Requirement List</DialogTitle>
            <DialogDescription>
              Update requirement list details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter requirement description"
              />
            </div>
            <div>
              <Label htmlFor="edit-metricId">Metric Type *</Label>
              <Select
                value={formData.metricId}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    metricId: value,
                    // Clear document type if metric changes away from File/Document
                    documentTypesId:
                      metrics.find((m) => m.metricId === value)?.description ===
                      "File/Document"
                        ? formData.documentTypesId
                        : null,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metric type" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((metric) => (
                    <SelectItem key={metric.metricId} value={metric.metricId}>
                      {metric.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedMetricDescription === "File/Document" && (
              <div>
                <Label htmlFor="edit-documentTypesId">Document Type *</Label>
                <Select
                  value={formData.documentTypesId || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, documentTypesId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((docType) => (
                      <SelectItem
                        key={docType.documentTypesId}
                        value={docType.documentTypesId}
                      >
                        {docType.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="edit-isActive">Is Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedRequirementList(null);
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
            <DialogTitle>Requirement List Details</DialogTitle>
            <DialogDescription>
              View requirement list information
            </DialogDescription>
          </DialogHeader>
          {selectedRequirementList && (
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm font-medium">
                  {selectedRequirementList.description}
                </p>
              </div>
              <div>
                <Label>Metric Type</Label>
                <p className="text-sm">
                  <Badge variant="outline">
                    {selectedRequirementList.metricDescription}
                  </Badge>
                </p>
              </div>
              <div>
                <Label>Document Type</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedRequirementList.documentTypeDescription || "N/A"}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <p className="text-sm">
                  <Badge
                    variant={
                      selectedRequirementList.isActive ? "default" : "secondary"
                    }
                  >
                    {selectedRequirementList.isActive ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedRequirementList(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Requirement List"
        description={
          selectedRequirementList
            ? `Are you sure you want to delete "${selectedRequirementList.description}"? This action cannot be undone and will fail if the requirement list is in use.`
            : "Are you sure you want to delete this requirement list?"
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedRequirementList(null);
        }}
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}
