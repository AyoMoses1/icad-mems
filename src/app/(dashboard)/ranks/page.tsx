"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Award,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  RankDto,
  getRanks,
  createRank,
  updateRank,
  deleteRank,
} from "@/lib/services/ranks";
import { formatDate } from "@/lib/utils";

export default function RanksPage() {
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<RankDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    departmentId: "",
    title: "",
    seniorityLevel: 0,
    category: "",
    description: "",
  });

  useEffect(() => {
    loadRanks();
  }, []);

  const loadRanks = async () => {
    setIsLoading(true);
    try {
      const result = await getRanks({ pageNumber: 1, pageSize: 100 });
      setRanks(result.items || []);
    } catch (error) {
      console.error("Failed to load ranks:", error);
      toast.error("Failed to load ranks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      departmentId: "",
      title: "",
      seniorityLevel: 0,
      category: "",
      description: "",
    });
    setSelectedRank(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (rank: RankDto) => {
    setFormData({
      departmentId: rank.departmentId,
      title: rank.title || "",
      seniorityLevel: rank.seniorityLevel,
      category: rank.category || "",
      description: rank.description || "",
    });
    setSelectedRank(rank);
    setIsEditOpen(true);
  };

  const handleDelete = (rank: RankDto) => {
    setSelectedRank(rank);
    setIsDeleteOpen(true);
  };

  const handleSubmitCreate = async () => {
    setIsSubmitting(true);
    try {
      await createRank(formData);
      toast.success("Rank created successfully");
      setIsCreateOpen(false);
      loadRanks();
    } catch (error: any) {
      toast.error(error.message || "Failed to create rank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedRank) return;

    setIsSubmitting(true);
    try {
      await updateRank(selectedRank.id, formData);
      toast.success("Rank updated successfully");
      setIsEditOpen(false);
      loadRanks();
    } catch (error: any) {
      toast.error(error.message || "Failed to update rank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRank) return;

    setIsSubmitting(true);
    try {
      await deleteRank(selectedRank.id);
      toast.success("Rank deleted successfully");
      setIsDeleteOpen(false);
      loadRanks();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete rank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<RankDto>[] = [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: ({ row }) => (
        <div className="font-medium">{row.title || "-"}</div>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      cell: ({ row }) => <div>{row.category || "-"}</div>,
    },
    {
      id: "seniorityLevel",
      header: "Seniority Level",
      accessorKey: "seniorityLevel",
      cell: ({ row }) => <div>{row.seniorityLevel}</div>,
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      cell: ({ row }) => (
        <div className="max-w-md truncate">{row.description || "-"}</div>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div>{row.createdAt ? formatDate(row.createdAt) : "-"}</div>
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
        title="Ranks"
        description="Manage seafarer ranks and positions"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Rank
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={ranks}
        isLoading={isLoading}
        emptyMessage="No ranks found"
        emptyDescription="Get started by adding your first rank."
        searchPlaceholder="Search ranks..."
        getRowId={(row) => row.id}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Rank</DialogTitle>
            <DialogDescription>
              Create a new rank for seafarers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department ID *</Label>
              <Input
                id="departmentId"
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                placeholder="Department UUID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Rank title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seniorityLevel">Seniority Level *</Label>
              <Input
                id="seniorityLevel"
                type="number"
                value={formData.seniorityLevel}
                onChange={(e) =>
                  setFormData({ ...formData, seniorityLevel: parseInt(e.target.value) || 0 })
                }
                placeholder="Seniority level"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Category"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Rank</DialogTitle>
            <DialogDescription>
              Update the rank information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-departmentId">Department ID</Label>
              <Input
                id="edit-departmentId"
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                placeholder="Department UUID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Rank title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-seniorityLevel">Seniority Level</Label>
              <Input
                id="edit-seniorityLevel"
                type="number"
                value={formData.seniorityLevel}
                onChange={(e) =>
                  setFormData({ ...formData, seniorityLevel: parseInt(e.target.value) || 0 })
                }
                placeholder="Seniority level"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Category"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
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
        title="Delete Rank"
        description={`Are you sure you want to delete "${selectedRank?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}

