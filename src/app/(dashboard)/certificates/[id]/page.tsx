"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LoadingSpinner,
  EmptyState,
} from "@/components/shared";
import {
  getCertificateById,
  getCertificateRequirements,
  createCertificateRequirement,
  updateCertificateRequirement,
  deleteCertificateRequirement,
  getCertificateFees,
  createCertificateFee,
  updateCertificateFee,
  deleteCertificateFee,
  type CertificateDto,
  type CertificateRequirementDto,
  type CertificateFeeDto,
  type CreateCertificateRequirementRequest,
  type CertificateFeeInput,
} from "@/lib/services/certificates-service";
import {
  getDocumentMasters,
  type DocumentMasterDto,
} from "@/lib/services/documents-master-service";
import { formatDate } from "@/lib/utils";

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificateId = params.id as string;
  const defaultTab = searchParams.get("tab") || "overview";

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificate, setCertificate] = useState<CertificateDto | null>(null);
  const [requirements, setRequirements] = useState<CertificateRequirementDto[]>(
    [],
  );
  const [fees, setFees] = useState<CertificateFeeDto[]>([]);
  const [documentMasters, setDocumentMasters] = useState<DocumentMasterDto[]>(
    [],
  );

  // Requirement modals
  const [isRequirementCreateOpen, setIsRequirementCreateOpen] = useState(false);
  const [isRequirementEditOpen, setIsRequirementEditOpen] = useState(false);
  const [isRequirementDeleteOpen, setIsRequirementDeleteOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] =
    useState<CertificateRequirementDto | null>(null);
  const [requirementFormData, setRequirementFormData] =
    useState<CreateCertificateRequirementRequest>({
      targetDocumentMasterId: certificateId,
      requiredDocumentMasterId: "",
      requirementGroupId: null,
      isMandatory: false,
    });

  // Fee modals
  const [isFeeCreateOpen, setIsFeeCreateOpen] = useState(false);
  const [isFeeEditOpen, setIsFeeEditOpen] = useState(false);
  const [isFeeDeleteOpen, setIsFeeDeleteOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<CertificateFeeDto | null>(
    null,
  );
  const [feeFormData, setFeeFormData] = useState<CertificateFeeInput>({
    amount: undefined,
    currency: "NGN",
    nationalityType: null,
    processingSpeed: null,
    billingCategory: null,
  });

  useEffect(() => {
    if (certificateId) {
      loadCertificate();
      loadRequirements();
      loadFees();
      loadDocumentMasters();
    }
  }, [certificateId]);

  const loadCertificate = async () => {
    setIsLoading(true);
    try {
      const response = await getCertificateById(certificateId);
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setCertificate(response.data);
      } else {
        toast.error(response.message || "Failed to load certificate");
        router.push("/certificates");
      }
    } catch (error: any) {
      console.error("Error loading certificate:", error);
      toast.error(error?.message || "Failed to load certificate");
      router.push("/certificates");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequirements = async () => {
    try {
      const response = await getCertificateRequirements(certificateId);
      const ok = response.success ?? (response as any).successful;
      if ((ok || response.data) && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setRequirements(data);
      }
    } catch (error: any) {
      console.error("Error loading requirements:", error);
    }
  };

  const loadFees = async () => {
    try {
      const response = await getCertificateFees(certificateId);
      const ok = response.success ?? (response as any).successful;
      if ((ok || response.data) && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setFees(data);
      }
    } catch (error: any) {
      console.error("Error loading fees:", error);
    }
  };

  const loadDocumentMasters = async () => {
    try {
      const response = await getDocumentMasters({
        pageNumber: 1,
        pageSize: 100,
      });
      const ok = response.success ?? (response as any).successful;
      if ((ok || response.data) && response.data) {
        const data = response.data.items || response.data || [];
        setDocumentMasters(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      console.error("Error loading document masters:", error);
    }
  };

  const getDocumentName = (documentMasterId?: string) => {
    if (!documentMasterId) return "N/A";
    const doc = documentMasters.find((d) => d.id === documentMasterId);
    return doc?.name || documentMasterId;
  };

  // Requirement handlers
  const handleRequirementCreate = async () => {
    if (!requirementFormData.requiredDocumentMasterId) {
      toast.error("Please select a required document");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createCertificateRequirement(
        certificateId,
        requirementFormData,
      );
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Requirement created successfully");
        setIsRequirementCreateOpen(false);
        setRequirementFormData({
          targetDocumentMasterId: certificateId,
          requiredDocumentMasterId: "",
          requirementGroupId: null,
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

  const handleRequirementEdit = (requirement: CertificateRequirementDto) => {
    setSelectedRequirement(requirement);
    setRequirementFormData({
      targetDocumentMasterId: certificateId,
      requiredDocumentMasterId: requirement.requiredDocumentMasterId || "",
      requirementGroupId: requirement.requirementGroupId || null,
      isMandatory: requirement.isMandatory ?? false,
    });
    setIsRequirementEditOpen(true);
  };

  const handleRequirementUpdate = async () => {
    if (!selectedRequirement || !requirementFormData.requiredDocumentMasterId) {
      toast.error("Please select a required document");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateCertificateRequirement(
        selectedRequirement.id!,
        requirementFormData,
      );
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Requirement updated successfully");
        setIsRequirementEditOpen(false);
        setSelectedRequirement(null);
        setRequirementFormData({
          targetDocumentMasterId: certificateId,
          requiredDocumentMasterId: "",
          requirementGroupId: null,
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

  const handleRequirementDelete = async () => {
    if (!selectedRequirement) return;

    setIsSubmitting(true);
    try {
      const response = await deleteCertificateRequirement(
        selectedRequirement.id!,
      );
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Requirement deleted successfully");
        setIsRequirementDeleteOpen(false);
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

  // Fee handlers
  const handleFeeCreate = async () => {
    if (feeFormData.amount === undefined || feeFormData.amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createCertificateFee(certificateId, feeFormData);
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Fee created successfully");
        setIsFeeCreateOpen(false);
        setFeeFormData({
          amount: undefined,
          currency: "NGN",
          nationalityType: null,
          processingSpeed: null,
          billingCategory: null,
        });
        await loadFees();
      } else {
        toast.error(response.message || "Failed to create fee");
      }
    } catch (error: any) {
      console.error("Error creating fee:", error);
      toast.error(error?.message || "Failed to create fee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeeEdit = (fee: CertificateFeeDto) => {
    setSelectedFee(fee);
    // Normalize values to match Select options
    const normalizedNationalityType =
      fee.nationalityType === "Nigerian" || fee.nationalityType === "Foreign"
        ? fee.nationalityType
        : null; // null will be converted to "all" in the Select

    const normalizedProcessingSpeed =
      fee.processingSpeed === "Express" || fee.processingSpeed === "Standard"
        ? fee.processingSpeed
        : null; // null will be converted to "Standard" in the Select

    setFeeFormData({
      amount: fee.amount,
      currency: fee.currency || "NGN",
      nationalityType: normalizedNationalityType,
      processingSpeed: normalizedProcessingSpeed,
      billingCategory: fee.billingCategory || null,
    });
    setIsFeeEditOpen(true);
  };

  const handleFeeUpdate = async () => {
    if (
      !selectedFee ||
      feeFormData.amount === undefined ||
      feeFormData.amount < 0
    ) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateCertificateFee(
        certificateId,
        selectedFee.id!,
        feeFormData,
      );
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Fee updated successfully");
        setIsFeeEditOpen(false);
        setSelectedFee(null);
        setFeeFormData({
          amount: undefined,
          currency: "NGN",
          nationalityType: null,
          processingSpeed: null,
          billingCategory: null,
        });
        await loadFees();
      } else {
        toast.error(response.message || "Failed to update fee");
      }
    } catch (error: any) {
      console.error("Error updating fee:", error);
      toast.error(error?.message || "Failed to update fee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeeDelete = async () => {
    if (!selectedFee) return;

    setIsSubmitting(true);
    try {
      const response = await deleteCertificateFee(
        certificateId,
        selectedFee.id!,
      );
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Fee deleted successfully");
        setIsFeeDeleteOpen(false);
        setSelectedFee(null);
        await loadFees();
      } else {
        toast.error(response.message || "Failed to delete fee");
      }
    } catch (error: any) {
      console.error("Error deleting fee:", error);
      toast.error(error?.message || "Failed to delete fee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requirementColumns: DataTableColumn<CertificateRequirementDto>[] = [
    {
      id: "requiredDocument",
      header: "Required Document",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.requiredDocumentName ||
            getDocumentName(row.requiredDocumentMasterId)}
        </div>
      ),
    },
    {
      id: "requirementGroupId",
      header: "Group ID",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.requirementGroupId || "N/A"}
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
            onClick={() => handleRequirementEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setSelectedRequirement(row);
              setIsRequirementDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const feeColumns: DataTableColumn<CertificateFeeDto>[] = [
    {
      id: "nationalityType",
      header: "Nationality",
      cell: ({ row }) => (
        <div className="text-sm">{row.nationalityType || "All"}</div>
      ),
    },
    {
      id: "processingSpeed",
      header: "Processing Speed",
      cell: ({ row }) => (
        <div className="text-sm">{row.processingSpeed || "Standard"}</div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.currency || "NGN"} {row.amount?.toLocaleString() || "0"}
        </div>
      ),
    },
    {
      id: "billingCategory",
      header: "Billing Category",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.billingCategory || "N/A"}
        </div>
      ),
    },
    {
      id: "isActive",
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
            onClick={() => handleFeeEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setSelectedFee(row);
              setIsFeeDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;
  if (!certificate) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/certificates")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <PageHeader
          title={certificate.name || "Certificate Details"}
          description="Manage certificate requirements and fees"
        />
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">
            Requirements ({requirements.length})
          </TabsTrigger>
          <TabsTrigger value="fees">Fees ({fees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Certificate Name</Label>
              <div className="mt-1 font-medium">
                {certificate.name || "N/A"}
              </div>
            </div>
            <div>
              <Label>Certificate Type</Label>
              <div className="mt-1">
                <Badge variant="default">{certificate.certType || "N/A"}</Badge>
              </div>
            </div>
            <div>
              <Label>Category Type</Label>
              <div className="mt-1">
                <Badge variant="secondary">
                  {certificate.categoryType || "N/A"}
                </Badge>
              </div>
            </div>
            <div>
              <Label>STCW Code</Label>
              <div className="mt-1 text-sm">
                {certificate.stcwCode || "N/A"}
              </div>
            </div>
            <div>
              <Label>Rank Level</Label>
              <div className="mt-1 text-sm">
                {certificate.rankLevel || "N/A"}
              </div>
            </div>
            <div>
              <Label>Tonnage Limit</Label>
              <div className="mt-1 text-sm">
                {certificate.tonnageLimit || "N/A"}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <div className="mt-1 text-sm text-muted-foreground">
                {certificate.description || "No description"}
              </div>
            </div>
            <div>
              <Label>Created Date</Label>
              <div className="mt-1 text-sm text-muted-foreground">
                {certificate.createdAt
                  ? formatDate(certificate.createdAt)
                  : "N/A"}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Certificate Requirements</h3>
            <Button onClick={() => setIsRequirementCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Requirement
            </Button>
          </div>

          {requirements.length === 0 ? (
            <EmptyState
              title="No requirements"
              description="Add requirements for this certificate"
              action={{
                label: "Add Requirement",
                onClick: () => setIsRequirementCreateOpen(true),
              }}
            />
          ) : (
            <DataTable columns={requirementColumns} data={requirements} />
          )}
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Certificate Fees</h3>
            <Button onClick={() => setIsFeeCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Fee
            </Button>
          </div>

          {fees.length === 0 ? (
            <EmptyState
              title="No fees"
              description="Add fees for this certificate"
              action={{
                label: "Add Fee",
                onClick: () => setIsFeeCreateOpen(true),
              }}
            />
          ) : (
            <DataTable columns={feeColumns} data={fees} />
          )}
        </TabsContent>
      </Tabs>

      {/* Requirement Create Modal */}
      <Dialog
        open={isRequirementCreateOpen}
        onOpenChange={setIsRequirementCreateOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Requirement</DialogTitle>
            <DialogDescription>
              Add a required document for this certificate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="requiredDocument">Required Document *</Label>
              <Select
                value={requirementFormData.requiredDocumentMasterId}
                onValueChange={(value) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    requiredDocumentMasterId: value,
                  })
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
            <div>
              <Label htmlFor="requirementGroupId">Requirement Group ID</Label>
              <Input
                id="requirementGroupId"
                type="number"
                value={requirementFormData.requirementGroupId || ""}
                onChange={(e) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    requirementGroupId: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isMandatory"
                checked={requirementFormData.isMandatory || false}
                onChange={(e) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    isMandatory: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="isMandatory">Is Mandatory</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRequirementCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleRequirementCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Requirement Edit Modal */}
      <Dialog
        open={isRequirementEditOpen}
        onOpenChange={setIsRequirementEditOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Requirement</DialogTitle>
            <DialogDescription>
              Update the requirement details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editRequiredDocument">Required Document *</Label>
              <Select
                value={requirementFormData.requiredDocumentMasterId}
                onValueChange={(value) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    requiredDocumentMasterId: value,
                  })
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
            <div>
              <Label htmlFor="editRequirementGroupId">
                Requirement Group ID
              </Label>
              <Input
                id="editRequirementGroupId"
                type="number"
                value={requirementFormData.requirementGroupId || ""}
                onChange={(e) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    requirementGroupId: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsMandatory"
                checked={requirementFormData.isMandatory || false}
                onChange={(e) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    isMandatory: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="editIsMandatory">Is Mandatory</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRequirementEditOpen(false);
                setSelectedRequirement(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleRequirementUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Requirement Delete Confirmation */}
      <ConfirmDialog
        open={isRequirementDeleteOpen}
        onOpenChange={setIsRequirementDeleteOpen}
        title="Delete Requirement"
        description={`Are you sure you want to delete this requirement?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleRequirementDelete}
        isLoading={isSubmitting}
      />

      {/* Fee Create Modal */}
      <Dialog open={isFeeCreateOpen} onOpenChange={setIsFeeCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Fee</DialogTitle>
            <DialogDescription>
              Add a fee structure for this certificate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nationalityType">Nationality Type</Label>
              <Select
                value={
                  feeFormData.nationalityType === "Nigerian" ||
                  feeFormData.nationalityType === "Foreign"
                    ? feeFormData.nationalityType
                    : "all"
                }
                onValueChange={(value) =>
                  setFeeFormData({
                    ...feeFormData,
                    nationalityType: value === "all" ? null : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Nigerian">Nigerian</SelectItem>
                  <SelectItem value="Foreign">Foreign</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="processingSpeed">Processing Speed</Label>
              <Select
                value={
                  feeFormData.processingSpeed === "Express" ||
                  feeFormData.processingSpeed === "Standard"
                    ? feeFormData.processingSpeed
                    : "Standard"
                }
                onValueChange={(value) =>
                  setFeeFormData({
                    ...feeFormData,
                    processingSpeed: value || null,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select processing speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Express">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={feeFormData.amount || ""}
                onChange={(e) =>
                  setFeeFormData({
                    ...feeFormData,
                    amount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={feeFormData.currency || "NGN"}
                onChange={(e) =>
                  setFeeFormData({
                    ...feeFormData,
                    currency: e.target.value,
                  })
                }
                placeholder="NGN"
                maxLength={10}
              />
            </div>
            <div>
              <Label htmlFor="billingCategory">Billing Category</Label>
              <Input
                id="billingCategory"
                value={feeFormData.billingCategory || ""}
                onChange={(e) =>
                  setFeeFormData({
                    ...feeFormData,
                    billingCategory: e.target.value || null,
                  })
                }
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFeeCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleFeeCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Edit Modal */}
      <Dialog open={isFeeEditOpen} onOpenChange={setIsFeeEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee</DialogTitle>
            <DialogDescription>Update the fee details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editNationalityType">Nationality Type</Label>
              <Select
                value={
                  feeFormData.nationalityType === "Nigerian" ||
                  feeFormData.nationalityType === "Foreign"
                    ? feeFormData.nationalityType
                    : "all"
                }
                onValueChange={(value) =>
                  setFeeFormData({
                    ...feeFormData,
                    nationalityType: value === "all" ? null : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Nigerian">Nigerian</SelectItem>
                  <SelectItem value="Foreign">Foreign</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editProcessingSpeed">Processing Speed</Label>
              <Select
                value={
                  feeFormData.processingSpeed === "Express" ||
                  feeFormData.processingSpeed === "Standard"
                    ? feeFormData.processingSpeed
                    : "Standard"
                }
                onValueChange={(value) =>
                  setFeeFormData({
                    ...feeFormData,
                    processingSpeed: value || null,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select processing speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Express">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editAmount">Amount *</Label>
              <Input
                id="editAmount"
                type="number"
                min="0"
                value={feeFormData.amount || ""}
                onChange={(e) =>
                  setFeeFormData({
                    ...feeFormData,
                    amount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="editCurrency">Currency</Label>
              <Input
                id="editCurrency"
                value={feeFormData.currency || "NGN"}
                onChange={(e) =>
                  setFeeFormData({
                    ...feeFormData,
                    currency: e.target.value,
                  })
                }
                placeholder="NGN"
                maxLength={10}
              />
            </div>
            <div>
              <Label htmlFor="editBillingCategory">Billing Category</Label>
              <Input
                id="editBillingCategory"
                value={feeFormData.billingCategory || ""}
                onChange={(e) =>
                  setFeeFormData({
                    ...feeFormData,
                    billingCategory: e.target.value || null,
                  })
                }
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsFeeEditOpen(false);
                setSelectedFee(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleFeeUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Delete Confirmation */}
      <ConfirmDialog
        open={isFeeDeleteOpen}
        onOpenChange={setIsFeeDeleteOpen}
        title="Delete Fee"
        description={`Are you sure you want to delete this fee?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleFeeDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}
