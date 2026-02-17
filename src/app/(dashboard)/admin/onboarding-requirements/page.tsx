"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { LoadingSpinner, PageHeader } from "@/components/shared";
import { getDocumentTypes, type DocumentTypeDto } from "@/lib/services/lookup-service";
import {
  getOnboardingRequirementsByRole,
  createOnboardingRequirement,
  updateOnboardingRequirement,
  deleteOnboardingRequirement,
  normalizeRequirementKind,
  type OnboardingRequirementDto,
  type CreateOnboardingRequirementRequest,
  type UpdateOnboardingRequirementRequest,
} from "@/lib/services/onboarding-requirements-service";

const ROLE_OPTIONS = ["SEAFARER"] as const;
const KIND_OPTIONS: { value: 0 | 1; label: string }[] = [
  { value: 0, label: "Compulsory" },
  { value: 1, label: "Optional" },
];

export default function AdminOnboardingRequirementsPage() {
  const [roleFilter, setRoleFilter] = useState<string>("SEAFARER");
  const [requirements, setRequirements] = useState<OnboardingRequirementDto[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] =
    useState<OnboardingRequirementDto | null>(null);

  // Form state for create/edit
  const [formRole, setFormRole] = useState<string>("SEAFARER");
  const [formDescription, setFormDescription] = useState("");
  const [formRequirementKind, setFormRequirementKind] = useState<0 | 1>(0);
  const [formDocumentTypeIds, setFormDocumentTypeIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRequirements = async () => {
    try {
      setIsLoading(true);
      const res = await getOnboardingRequirementsByRole(roleFilter);
      if (res.success && res.data) {
        setRequirements(res.data);
      } else {
        setRequirements([]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load onboarding requirements");
      setRequirements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const res = await getDocumentTypes();
      if (res.success && res.data) {
        setDocumentTypes(res.data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load document types");
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [roleFilter]);

  useEffect(() => {
    loadDocumentTypes();
  }, []);

  const openCreate = () => {
    setFormRole("SEAFARER");
    setFormDescription("");
    setFormRequirementKind(0);
    setFormDocumentTypeIds([]);
    setIsCreateOpen(true);
  };

  const openEdit = (req: OnboardingRequirementDto) => {
    setSelectedRequirement(req);
    setFormRole(req.role);
    setFormDescription(req.description);
    setFormRequirementKind(normalizeRequirementKind(req.requirementKind));
    setFormDocumentTypeIds(req.documentTypeIds ?? req.documentTypes?.map((dt) => dt.documentTypesId) ?? []);
    setIsEditOpen(true);
  };

  const openDelete = (req: OnboardingRequirementDto) => {
    setSelectedRequirement(req);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    if (!formDescription.trim()) {
      toast.error("Description is required");
      return;
    }
    if (formDocumentTypeIds.length === 0) {
      toast.error("Select at least one document type");
      return;
    }
    try {
      setIsSubmitting(true);
      const body: CreateOnboardingRequirementRequest = {
        role: formRole,
        description: formDescription.trim(),
        requirementKind: formRequirementKind,
        documentTypes: formDocumentTypeIds.map((id) => ({ documentTypesId: id })),
      };
      const res = await createOnboardingRequirement(body);
      if (res.success) {
        toast.success("Requirement created");
        setIsCreateOpen(false);
        loadRequirements();
      } else {
        toast.error(res.error?.message ?? res.message ?? "Create failed");
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedRequirement) return;
    if (!formDescription.trim()) {
      toast.error("Description is required");
      return;
    }
    if (formDocumentTypeIds.length === 0) {
      toast.error("Select at least one document type");
      return;
    }
    try {
      setIsSubmitting(true);
      const body: UpdateOnboardingRequirementRequest = {
        description: formDescription.trim(),
        requirementKind: formRequirementKind,
        documentTypes: formDocumentTypeIds.map((id) => ({ documentTypesId: id })),
      };
      const res = await updateOnboardingRequirement(
        selectedRequirement.onboardingRequirementId,
        body
      );
      if (res.success) {
        toast.success("Requirement updated");
        setIsEditOpen(false);
        setSelectedRequirement(null);
        loadRequirements();
      } else {
        toast.error(res.error?.message ?? res.message ?? "Update failed");
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequirement) return;
    try {
      setIsSubmitting(true);
      const res = await deleteOnboardingRequirement(
        selectedRequirement.onboardingRequirementId
      );
      if (res.success) {
        toast.success("Requirement removed");
        setIsDeleteOpen(false);
        setSelectedRequirement(null);
        loadRequirements();
      } else {
        toast.error(res.error?.message ?? res.message ?? "Delete failed");
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDocumentType = (id: string) => {
    setFormDocumentTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding Requirements"
        description="Manage document requirements for seafarer onboarding (compulsory and optional)."
      />

      <div className="flex flex-wrap items-center gap-4">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Requirements for {roleFilter} ({requirements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : requirements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No onboarding requirements defined.</p>
              <p className="text-sm mt-1">
                Add a requirement to define which documents seafarers must upload.
              </p>
              <Button className="mt-4" variant="outline" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {requirements.map((req) => (
                <div
                  key={req.onboardingRequirementId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{req.description}</span>
                      <Badge variant={req.requirementKind === 0 ? "destructive" : "secondary"}>
                        {req.requirementKind === 0 ? (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Compulsory
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Optional
                          </>
                        )}
                      </Badge>
                    </div>
                    {req.documentTypes && req.documentTypes.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Document types: {req.documentTypes.map((dt) => dt.description).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(req)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => openDelete(req)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add onboarding requirement</DialogTitle>
            <DialogDescription>
              Define a document requirement for seafarer onboarding. Compulsory items must be satisfied before submit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="e.g. Passport, Medical Certificate"
              />
            </div>
            <div className="space-y-2">
              <Label>Requirement kind</Label>
              <Select
                value={String(formRequirementKind)}
                onValueChange={(v) => setFormRequirementKind(Number(v) as 0 | 1)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Document types (at least one) *</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {documentTypes.map((dt) => {
                  const id = dt.documentTypesId?.toString().trim();
                  if (!id) return null;
                  const checked = formDocumentTypeIds.includes(id);
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDocumentType(id)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{dt.description}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit onboarding requirement</DialogTitle>
            <DialogDescription>
              Update description, kind, or accepted document types.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="e.g. Passport"
              />
            </div>
            <div className="space-y-2">
              <Label>Requirement kind</Label>
              <Select
                value={String(formRequirementKind)}
                onValueChange={(v) => setFormRequirementKind(Number(v) as 0 | 1)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Document types (at least one) *</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {documentTypes.map((dt) => {
                  const id = dt.documentTypesId?.toString().trim();
                  if (!id) return null;
                  const checked = formDocumentTypeIds.includes(id);
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDocumentType(id)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{dt.description}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove requirement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the requirement &quot;{selectedRequirement?.description}&quot;.
              Seafarers will no longer see this item on the documents checklist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
