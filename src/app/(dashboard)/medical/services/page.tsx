"use client";

import { useState, useEffect } from "react";
import {
  Stethoscope,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  DataTable,
  DataTableColumn,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
} from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  getMedicalServices,
  createMedicalService,
  updateMedicalService,
  deleteMedicalService,
  type MedicalServiceDto,
  type CreateMedicalServiceRequest,
} from "@/lib/services/medical-service";
import { getInstitutions, type InstitutionDto } from "@/lib/services/institutions";
import { formatDate } from "@/lib/utils";

export default function MedicalServicesPage() {
  const [services, setServices] = useState<MedicalServiceDto[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<MedicalServiceDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateMedicalServiceRequest>({
    serviceName: "",
    description: "",
    duration: 30,
    price: 0,
    isActive: true,
  });
  const pageSize = 20;

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    if (selectedInstitutionId) {
      loadServices();
    }
  }, [currentPage, searchQuery, selectedInstitutionId]);

  const loadInstitutions = async () => {
    try {
      const res = await getInstitutions({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });
      setInstitutions(res.items || []);
      if (res.items && res.items.length > 0) {
        setSelectedInstitutionId(res.items[0].id);
      }
    } catch (error) {
      console.error("Error loading institutions:", error);
    }
  };

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const response = await getMedicalServices(selectedInstitutionId, {
        pageNumber: currentPage,
        pageSize,
        searchTerm: searchQuery || undefined,
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setServices(response.data.items || []);
        setTotalPages(
          response.data.totalNumber
            ? Math.ceil(response.data.totalNumber / pageSize)
            : 1
        );
        setTotalCount(response.data.totalNumber || 0);
      } else {
        // If no data, set empty array
        setServices([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Failed to load medical services");
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedService(null);
    setFormData({
      serviceName: "",
      description: "",
      duration: 30,
      price: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (service: MedicalServiceDto) => {
    setSelectedService(service);
    setFormData({
      serviceName: service.serviceName || "",
      description: service.description || "",
      duration: service.duration || 30,
      price: service.price || 0,
      isActive: service.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (service: MedicalServiceDto) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.serviceName) {
      toast.error("Service name is required");
      return;
    }

    if (!selectedInstitutionId) {
      toast.error("Please select an institution");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        institutionId: selectedInstitutionId,
      };

      let response;
      if (selectedService) {
        response = await updateMedicalService(selectedService.id, payload);
      } else {
        response = await createMedicalService(payload);
      }

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success(
          selectedService
            ? "Service updated successfully"
            : "Service created successfully"
        );
        setIsDialogOpen(false);
        loadServices();
      } else {
        toast.error(
          response.message ||
            (selectedService
              ? "Failed to update service"
              : "Failed to create service")
        );
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      const response = await deleteMedicalService(selectedService.id);

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Service deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedService(null);
        loadServices();
      } else {
        toast.error(response.message || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<MedicalServiceDto>[] = [
    {
      id: "serviceName",
      header: "Service Name",
      accessorKey: "serviceName",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.serviceName || "N/A"}</p>
          {row.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "duration",
      header: "Duration",
      accessorKey: "duration",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.duration || 0} min</span>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "price",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.price ? `₦${row.price.toLocaleString()}` : "Free"}
          </span>
        </div>
      ),
    },
    {
      id: "isActive",
      header: "Status",
      accessorKey: "isActive",
      cell: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(row)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Medical Services"
          description="Manage medical services offered by your institution"
        />
        <Button
          onClick={handleCreate}
          className="bg-[#3EADC0] hover:bg-[#35a0b3]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Institution Selector */}
      {institutions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label>Institution</Label>
              <select
                value={selectedInstitutionId}
                onChange={(e) => {
                  setSelectedInstitutionId(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name || inst.id}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Services Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services found"
          description="Create your first medical service to get started"
          action={
            <Button
              onClick={handleCreate}
              className="bg-[#3EADC0] hover:bg-[#35a0b3]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={services}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? "Edit Service" : "Create New Service"}
            </DialogTitle>
            <DialogDescription>
              {selectedService
                ? "Update service information"
                : "Add a new medical service"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="serviceName">
                Service Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="serviceName"
                value={formData.serviceName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, serviceName: e.target.value })
                }
                placeholder="e.g., Medical Examination"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Service description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || 30}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: Number(e.target.value),
                    })
                  }
                  min="1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number(e.target.value),
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#3EADC0] hover:bg-[#35a0b3]"
            >
              {isSubmitting
                ? "Saving..."
                : selectedService
                  ? "Update Service"
                  : "Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Service"
        description={`Are you sure you want to delete "${selectedService?.serviceName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        isDestructive
        isLoading={isSubmitting}
      />
    </div>
  );
}

