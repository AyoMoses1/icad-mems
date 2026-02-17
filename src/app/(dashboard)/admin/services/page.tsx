"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/shared";
import { useCanManageServices } from "@/utils/permissions";
import {
  servicesApi,
  serviceManagementApi,
} from "@/lib/services/service-management-api";
import type { ServiceDto } from "@/types/service-management";

export default function ServicesManagementPage() {
  const router = useRouter();
  const canManage = useCanManageServices();

  const [services, setServices] = useState<ServiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceDto | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!canManage) {
      setError("Access Denied: Admin access required");
      setIsLoading(false);
      return;
    }
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  const loadServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesApi.getServices();
      setServices(data);
    } catch (err: any) {
      console.error("Failed to load services:", err);
      setError(err.message || "Failed to load services");
      toast.error(err.message || "Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (service: ServiceDto) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    try {
      await serviceManagementApi.deleteService(serviceToDelete.serviceId);
      toast.success("Service deleted successfully");
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      await loadServices();
    } catch (err: any) {
      console.error("Failed to delete service:", err);
      toast.error(err.message || "Failed to delete service");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredServices = services.filter((service) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      service.serviceName?.toLowerCase().includes(search) ||
      service.description?.toLowerCase().includes(search) ||
      service.serviceTypeDescription?.toLowerCase().includes(search)
    );
  });

  // Show access denied for non-admins
  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Service Management"
          description="Manage services and their requirements"
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-center max-w-md">
              You do not have permission to manage services. This feature is
              available to administrators only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Service Management"
          description="Manage services and their requirements"
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error && !services.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Service Management"
          description="Manage services and their requirements"
        />
        <ErrorState message={error} onRetry={loadServices} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Management"
        description="Manage services and their requirements"
      />

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Button
          onClick={() => router.push("/admin/services/create")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Service
        </Button>
      </div>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          {filteredServices.length === 0 ? (
            <EmptyState
              title="No services found"
              description={
                searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first service"
              }
              action={
                !searchTerm
                  ? {
                      label: "Create Service",
                      onClick: () => router.push("/admin/services/create"),
                    }
                  : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.serviceId}>
                    <TableCell className="font-medium">
                      {service.serviceName}
                    </TableCell>
                    <TableCell>{service.serviceTypeDescription}</TableCell>
                    <TableCell>{service.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {service.requirements?.length || 0} requirement
                      {(service.requirements?.length || 0) !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/services/${service.serviceId}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/admin/services/${service.serviceId}/edit`,
                            )
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{serviceToDelete?.serviceName}"?
              This action cannot be undone. If this service has active
              applications, it cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
