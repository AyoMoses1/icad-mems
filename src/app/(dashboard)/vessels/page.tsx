"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Ship,
  Loader2,
} from "lucide-react";
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
  PageHeader,
  DataTable,
  DataTableColumn,
  ConfirmDialog,
} from "@/components/shared";
import {
  VesselDto,
  getVessels,
  createVessel,
  updateVessel,
  deleteVessel,
} from "@/lib/services/vessels-service";
import { getShipByImo } from "@/lib/services/imo-ship-lookup-service";
import { formatDate } from "@/lib/utils";

export default function VesselsPage() {
  const [vessels, setVessels] = useState<VesselDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<VesselDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    imoNumber: "",
    builtDate: "",
    isActive: true,
  });
  const [vesselDetailsFromApi, setVesselDetailsFromApi] = useState(false);
  const [imoLookupLoading, setImoLookupLoading] = useState(false);

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
    setIsLoading(true);
    try {
      const response = await getVessels({ pageNumber: 1, pageSize: 100 });
      if (response.success ?? (response as any).successful) {
        setVessels(response.data?.items || []);
      } else {
        toast.error("Failed to load vessels");
      }
    } catch (error) {
      console.error("Failed to load vessels:", error);
      toast.error("Failed to load vessels");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      imoNumber: "",
      builtDate: "",
      isActive: true,
    });
    setVesselDetailsFromApi(false);
    setSelectedVessel(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (vessel: VesselDto) => {
    setFormData({
      name: vessel.name || "",
      imoNumber: vessel.imoNumber || "",
      builtDate: vessel.builtDate ? vessel.builtDate.split("T")[0] : "",
      isActive: vessel.isActive,
    });
    setVesselDetailsFromApi(false);
    setSelectedVessel(vessel);
    setIsEditOpen(true);
  };

  const handleImoLookup = async () => {
    const imo = formData.imoNumber.trim();
    if (!imo) {
      toast.error("Enter IMO number first");
      return;
    }
    setImoLookupLoading(true);
    try {
      const ship = await getShipByImo(imo);
      if (!ship) {
        toast.error("Vessel not found for this IMO number");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        name: ship.shipName,
        builtDate: ship.yearBuilt ? `${ship.yearBuilt}-01-01` : prev.builtDate,
      }));
      setVesselDetailsFromApi(true);
      toast.success("Vessel details filled from registry");
    } catch {
      toast.error("Failed to look up vessel by IMO");
    } finally {
      setImoLookupLoading(false);
    }
  };

  const handleDelete = (vessel: VesselDto) => {
    setSelectedVessel(vessel);
    setIsDeleteOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name || !formData.builtDate) {
      toast.error("Name and Built Date are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await createVessel({
        name: formData.name.trim() || undefined,
        imoNumber: formData.imoNumber.trim() || undefined,
        builtDate: new Date(formData.builtDate).toISOString(),
        isActive: formData.isActive,
      });
      if (response.success ?? (response as any).successful) {
        toast.success("Vessel created successfully");
        setIsCreateOpen(false);
        loadVessels();
      } else {
        toast.error("Failed to create vessel");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create vessel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedVessel) return;

    setIsSubmitting(true);
    try {
      const response = await updateVessel(selectedVessel.id, {
        name: formData.name.trim() || undefined,
        imoNumber: formData.imoNumber.trim() || undefined,
        builtDate: formData.builtDate ? new Date(formData.builtDate).toISOString() : undefined,
        isActive: formData.isActive,
      });
      if (response.success ?? (response as any).successful) {
        toast.success("Vessel updated successfully");
        setIsEditOpen(false);
        loadVessels();
      } else {
        toast.error("Failed to update vessel");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update vessel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedVessel) return;

    setIsSubmitting(true);
    try {
      const response = await deleteVessel(selectedVessel.id);
      if (response.success ?? (response as any).successful) {
        toast.success("Vessel deleted successfully");
        setIsDeleteOpen(false);
        loadVessels();
      } else {
        toast.error("Failed to delete vessel");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete vessel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<VesselDto>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.name || "-"}</div>
      ),
    },
    {
      id: "imoNumber",
      header: "IMO Number",
      accessorKey: "imoNumber",
      cell: ({ row }) => <div>{row.imoNumber || "-"}</div>,
    },
    {
      id: "builtDate",
      header: "Built Date",
      accessorKey: "builtDate",
      cell: ({ row }) => (
        <div>{row.builtDate ? formatDate(row.builtDate) : "-"}</div>
      ),
    },
    {
      id: "isActive",
      header: "Status",
      accessorKey: "isActive",
      cell: ({ row }) => (
        <Badge variant={row.isActive ? "success" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
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
        title="Vessels"
        description="Manage vessels and ship information"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vessel
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={vessels}
        isLoading={isLoading}
        emptyMessage="No vessels found"
        emptyDescription="Get started by adding your first vessel."
        searchPlaceholder="Search vessels..."
        getRowId={(row) => row.id.toString()}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vessel</DialogTitle>
            <DialogDescription>
              Create a new vessel record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="imoNumber">IMO Number</Label>
              <div className="flex gap-2">
                <Input
                  id="imoNumber"
                  value={formData.imoNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, imoNumber: e.target.value });
                    if (vesselDetailsFromApi) setVesselDetailsFromApi(false);
                  }}
                  placeholder="IMO number"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImoLookup}
                  disabled={!formData.imoNumber.trim() || imoLookupLoading}
                >
                  {imoLookupLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Look up"
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Vessel name (or use Look up from IMO)"
                readOnly={vesselDetailsFromApi}
                className={vesselDetailsFromApi ? "bg-muted" : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="builtDate">Built Date *</Label>
              <Input
                id="builtDate"
                type="date"
                value={formData.builtDate}
                onChange={(e) =>
                  setFormData({ ...formData, builtDate: e.target.value })
                }
                readOnly={vesselDetailsFromApi}
                className={vesselDetailsFromApi ? "bg-muted" : undefined}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vessel</DialogTitle>
            <DialogDescription>
              Update the vessel information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-imoNumber">IMO Number</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-imoNumber"
                  value={formData.imoNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, imoNumber: e.target.value });
                    if (vesselDetailsFromApi) setVesselDetailsFromApi(false);
                  }}
                  placeholder="IMO number"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImoLookup}
                  disabled={!formData.imoNumber.trim() || imoLookupLoading}
                >
                  {imoLookupLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Look up"
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Vessel name (or use Look up from IMO)"
                readOnly={vesselDetailsFromApi}
                className={vesselDetailsFromApi ? "bg-muted" : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-builtDate">Built Date</Label>
              <Input
                id="edit-builtDate"
                type="date"
                value={formData.builtDate}
                onChange={(e) =>
                  setFormData({ ...formData, builtDate: e.target.value })
                }
                readOnly={vesselDetailsFromApi}
                className={vesselDetailsFromApi ? "bg-muted" : undefined}
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
        title="Delete Vessel"
        description={`Are you sure you want to delete "${selectedVessel?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}

