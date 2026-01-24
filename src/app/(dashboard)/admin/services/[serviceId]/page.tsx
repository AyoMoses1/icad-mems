"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner, ErrorState } from "@/components/shared";
import { useCanManageServices } from "@/utils/permissions";
import { servicesApi, serviceManagementApi } from "@/lib/services/service-management-api";
import type {
  ServiceDto,
  ServiceRequirementDto,
} from "@/types/service-management";
import { AddRequirementDialog } from "@/components/service-management/AddRequirementDialog";
import { EditRequirementDialog } from "@/components/service-management/EditRequirementDialog";
import { getAllowedDocumentTypes } from "@/lib/utils/requirement-helpers";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;
  const canManage = useCanManageServices();

  const [service, setService] = useState<ServiceDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addRequirementOpen, setAddRequirementOpen] = useState(false);
  const [editRequirementOpen, setEditRequirementOpen] = useState(false);
  const [requirementToEdit, setRequirementToEdit] =
    useState<ServiceRequirementDto | null>(null);
  const [deleteRequirementOpen, setDeleteRequirementOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] =
    useState<ServiceRequirementDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const loadService = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesApi.getServiceById(serviceId);
      setService(data);
    } catch (err: any) {
      console.error("Failed to load service:", err);
      setError(err.message || "Failed to load service");
      toast.error(err.message || "Failed to load service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequirement = () => {
    setAddRequirementOpen(true);
  };

  const handleEditRequirement = (requirement: ServiceRequirementDto) => {
    setRequirementToEdit(requirement);
    setEditRequirementOpen(true);
  };

  const handleDeleteRequirement = (requirement: ServiceRequirementDto) => {
    setRequirementToDelete(requirement);
    setDeleteRequirementOpen(true);
  };

  const confirmDeleteRequirement = async () => {
    if (!requirementToDelete || !service) return;

    setIsDeleting(true);
    try {
      await serviceManagementApi.deleteServiceRequirement(
        service.serviceId,
        requirementToDelete.serviceRequirementId
      );
      toast.success("Requirement deleted successfully");
      setDeleteRequirementOpen(false);
      setRequirementToDelete(null);
      await loadService();
    } catch (err: any) {
      console.error("Failed to delete requirement:", err);
      toast.error(err.message || "Failed to delete requirement");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequirementAdded = () => {
    setAddRequirementOpen(false);
    loadService();
  };

  const handleRequirementUpdated = () => {
    setEditRequirementOpen(false);
    setRequirementToEdit(null);
    loadService();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Service Details" />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="space-y-6">
        <PageHeader title="Service Details" />
        <ErrorState
          message={error || "Service not found"}
          onRetry={loadService}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/services")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Button>
          <PageHeader
            title={service.serviceName}
            description={service.description}
          />
        </div>
        {canManage && (
          <Button
            onClick={() => router.push(`/admin/services/${serviceId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Service
          </Button>
        )}
      </div>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Service Type</p>
              <p className="font-medium">{service.serviceTypeDescription}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          {service.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{service.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Requirements</CardTitle>
          {canManage && (
            <Button onClick={handleAddRequirement} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Requirement
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {service.requirements && service.requirements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Required Value</TableHead>
                  <TableHead>Document Type</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {service.requirements.map((requirement) => (
                  <TableRow key={requirement.serviceRequirementId}>
                    <TableCell className="font-medium">
                      {requirement.requirementName}
                    </TableCell>
                    <TableCell>{requirement.rankDescription}</TableCell>
                    <TableCell>{requirement.requiredValue}</TableCell>
                    <TableCell>
                      {(() => {
                        const allowedTypes = getAllowedDocumentTypes(requirement);
                        if (allowedTypes.length > 0) {
                          return allowedTypes.map(t => t.description).join(", ");
                        } else if (requirement.documentTypeDescription) {
                          return requirement.documentTypeDescription;
                        }
                        return "N/A";
                      })()}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRequirement(requirement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRequirement(requirement)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No requirements configured</p>
              {canManage && (
                <Button
                  onClick={handleAddRequirement}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Requirement
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Requirement Dialog */}
      {canManage && (
        <AddRequirementDialog
          open={addRequirementOpen}
          onOpenChange={setAddRequirementOpen}
          serviceId={service.serviceId}
          onSuccess={handleRequirementAdded}
        />
      )}

      {/* Edit Requirement Dialog */}
      {canManage && requirementToEdit && (
        <EditRequirementDialog
          open={editRequirementOpen}
          onOpenChange={setEditRequirementOpen}
          serviceId={service.serviceId}
          requirement={requirementToEdit}
          onSuccess={handleRequirementUpdated}
        />
      )}

      {/* Delete Requirement Dialog */}
      {canManage && (
        <AlertDialog
          open={deleteRequirementOpen}
          onOpenChange={setDeleteRequirementOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Requirement</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this requirement? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteRequirement}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
