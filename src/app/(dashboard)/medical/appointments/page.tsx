"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Plus,
  Search,
  MoreVertical,
  Edit,
  X,
  CheckCircle2,
  AlertCircle,
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
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getMedicalAppointments,
  createMedicalAppointment,
  updateMedicalAppointment,
  cancelMedicalAppointment,
  type MedicalAppointmentDto,
  type CreateMedicalAppointmentRequest,
} from "@/lib/services/medical-service";
import { getMedicalServices, type MedicalServiceDto } from "@/lib/services/medical-service";
import { getInstitutions, type InstitutionDto } from "@/lib/services/institutions";
import { getSeafarers } from "@/lib/services/seafarers";
import { formatDate } from "@/lib/utils";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  Scheduled: { label: "Scheduled", variant: "secondary" },
  Completed: { label: "Completed", variant: "default" },
  Cancelled: { label: "Cancelled", variant: "destructive" },
  NoShow: { label: "No Show", variant: "outline" },
};

export default function MedicalAppointmentsPage() {
  const [appointments, setAppointments] = useState<MedicalAppointmentDto[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [services, setServices] = useState<MedicalServiceDto[]>([]);
  const [seafarers, setSeafarers] = useState<any[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<MedicalAppointmentDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateMedicalAppointmentRequest>({
    seafarerId: "",
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  });
  const pageSize = 20;

  useEffect(() => {
    loadInstitutions();
    loadServices();
    loadSeafarers();
  }, []);

  useEffect(() => {
    if (selectedInstitutionId) {
      loadAppointments();
    }
  }, [currentPage, statusFilter, selectedInstitutionId]);

  const loadInstitutions = async () => {
    try {
      const res = await getInstitutions({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });
      setInstitutions(res.items || []);
      if (res.items && res.items.length > 0 && res.items[0].id) {
        setSelectedInstitutionId(res.items[0].id);
      }
    } catch (error) {
      console.error("Error loading institutions:", error);
    }
  };

  const loadServices = async () => {
    try {
      if (selectedInstitutionId) {
        const response = await getMedicalServices(selectedInstitutionId, {
          pageNumber: 1,
          pageSize: 100,
        });
        const ok = response.success ?? (response as any).successful;
        if (ok && response.data) {
          setServices(response.data.items || []);
        }
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const loadSeafarers = async () => {
    try {
      const response = await getSeafarers({
        pageNumber: 1,
        pageSize: 100,
      });
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setSeafarers(response.data.items || []);
      }
    } catch (error) {
      console.error("Error loading seafarers:", error);
    }
  };

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await getMedicalAppointments(selectedInstitutionId, {
        pageNumber: currentPage,
        pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setAppointments(response.data.items || []);
        setTotalPages(
          response.data.totalNumber
            ? Math.ceil(response.data.totalNumber / pageSize)
            : 1
        );
        setTotalCount(response.data.totalNumber || 0);
      } else {
        setAppointments([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInstitutionId) {
      loadServices();
    }
  }, [selectedInstitutionId]);

  const handleCreate = () => {
    setSelectedAppointment(null);
    setFormData({
      seafarerId: "",
      serviceId: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (appointment: MedicalAppointmentDto) => {
    setSelectedAppointment(appointment);
    setFormData({
      seafarerId: appointment.seafarerId || "",
      serviceId: appointment.serviceId || "",
      appointmentDate: appointment.appointmentDate
        ? appointment.appointmentDate.split("T")[0]
        : "",
      appointmentTime: appointment.appointmentTime || "",
      notes: appointment.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleCancel = (appointment: MedicalAppointmentDto) => {
    setSelectedAppointment(appointment);
    setIsCancelDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.seafarerId || !formData.serviceId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error("Please fill in all required fields");
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
      if (selectedAppointment) {
        response = await updateMedicalAppointment(selectedAppointment.id, {
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          notes: formData.notes,
        });
      } else {
        response = await createMedicalAppointment(payload);
      }

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success(
          selectedAppointment
            ? "Appointment updated successfully"
            : "Appointment created successfully"
        );
        setIsDialogOpen(false);
        loadAppointments();
      } else {
        toast.error(
          response.message ||
            (selectedAppointment
              ? "Failed to update appointment"
              : "Failed to create appointment")
        );
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Failed to save appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    setIsSubmitting(true);
    try {
      const response = await cancelMedicalAppointment(selectedAppointment.id);

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Appointment cancelled successfully");
        setIsCancelDialogOpen(false);
        setSelectedAppointment(null);
        loadAppointments();
      } else {
        toast.error(response.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusKey = status || "Scheduled";
    const config = statusConfig[statusKey] || statusConfig.Scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: DataTableColumn<MedicalAppointmentDto>[] = [
    {
      id: "seafarerName",
      header: "Seafarer",
      accessorKey: "seafarerName",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {row.seafarerName || "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "serviceName",
      header: "Service",
      accessorKey: "serviceName",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <span>{row.serviceName || "N/A"}</span>
        </div>
      ),
    },
    {
      id: "appointmentDate",
      header: "Date",
      accessorKey: "appointmentDate",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{row.appointmentDate ? formatDate(row.appointmentDate) : "N/A"}</span>
        </div>
      ),
    },
    {
      id: "appointmentTime",
      header: "Time",
      accessorKey: "appointmentTime",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{row.appointmentTime || "N/A"}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => getStatusBadge(row.status),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
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
            {row.status !== "Cancelled" && row.status !== "Completed" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleCancel(row)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Medical Appointments"
          description="View and manage medical appointments"
        />
        <Button
          onClick={handleCreate}
          className="bg-[#3EADC0] hover:bg-[#35a0b3]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
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
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
            <SelectItem value="NoShow">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="Create your first appointment to get started"
          action={{
            label: "New Appointment",
            onClick: handleCreate,
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={appointments}
          currentPage={currentPage}
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
              {selectedAppointment ? "Edit Appointment" : "Create New Appointment"}
            </DialogTitle>
            <DialogDescription>
              {selectedAppointment
                ? "Update appointment information"
                : "Schedule a new medical appointment"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="seafarerId">
                Seafarer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.seafarerId}
                onValueChange={(value) =>
                  setFormData({ ...formData, seafarerId: value })
                }
                disabled={!!selectedAppointment}
              >
                <SelectTrigger id="seafarerId">
                  <SelectValue placeholder="Select seafarer" />
                </SelectTrigger>
                <SelectContent>
                  {seafarers.map((seafarer) => (
                    <SelectItem
                      key={seafarer.id}
                      value={seafarer.id}
                    >
                      {seafarer.firstName} {seafarer.lastName} ({seafarer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceId">
                Service <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceId: value })
                }
              >
                <SelectTrigger id="serviceId">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.serviceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="appointmentDate">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointmentTime">
                  Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
                rows={3}
              />
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
                : selectedAppointment
                  ? "Update Appointment"
                  : "Create Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Cancel Appointment"
        description={`Are you sure you want to cancel this appointment? This action cannot be undone.`}
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
        onConfirm={handleConfirmCancel}
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}

