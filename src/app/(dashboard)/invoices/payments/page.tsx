"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PageHeader,
  DataTable,
  DataTableColumn,
  LoadingSpinner,
  EmptyState,
} from "@/components/shared";
import type { PaymentDto } from "@/types/payment";
import { formatDate } from "@/lib/utils";
import {
  getPayments,
  getPaymentById,
  initiatePayment,
  verifyPayment,
  recordManualPayment,
} from "@/lib/services/payment-service";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  Completed: { label: "Completed", variant: "default" },
  Pending: { label: "Pending", variant: "secondary" },
  Failed: { label: "Failed", variant: "destructive" },
  Cancelled: { label: "Cancelled", variant: "destructive" },
  Processing: { label: "Processing", variant: "outline" },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isManualPaymentDialogOpen, setIsManualPaymentDialogOpen] =
    useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDto | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const pageSize = 20;

  // Manual payment form state
  const [manualPaymentForm, setManualPaymentForm] = useState({
    invoiceId: "",
    amount: "",
    paymentMethod: "Cash",
    paymentReference: "",
    notes: "",
  });

  // Payment verification state
  const [paymentReference, setPaymentReference] = useState("");

  useEffect(() => {
    loadPayments();
  }, [currentPage, searchTerm, statusFilter]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      // The /api/Payments endpoint does not exist in the API
      // Payments are accessed through applications
      setPayments([]);
      setTotalPages(0);
      setTotalCount(0);
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentReference.trim()) {
      toast.error("Please enter a payment reference");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await verifyPayment(paymentReference.trim());
      if (response.success && response.data) {
        toast.success("Payment verified successfully");
        setSelectedPayment(response.data);
        setIsVerifyDialogOpen(false);
        setPaymentReference("");
        loadPayments();
      } else {
        toast.error(response.message || "Failed to verify payment");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Failed to verify payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordManualPayment = async () => {
    if (!manualPaymentForm.invoiceId || !manualPaymentForm.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await recordManualPayment({
        invoiceId: parseInt(manualPaymentForm.invoiceId),
        amount: parseFloat(manualPaymentForm.amount),
        paymentMethod: manualPaymentForm.paymentMethod,
        paymentReference: manualPaymentForm.paymentReference || undefined,
        notes: manualPaymentForm.notes || undefined,
      });

      if (response.success && response.data) {
        toast.success("Manual payment recorded successfully");
        setIsManualPaymentDialogOpen(false);
        setManualPaymentForm({
          invoiceId: "",
          amount: "",
          paymentMethod: "Cash",
          paymentReference: "",
          notes: "",
        });
        loadPayments();
      } else {
        toast.error(response.message || "Failed to record manual payment");
      }
    } catch (error) {
      console.error("Error recording manual payment:", error);
      toast.error("Failed to record manual payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPayment = async (payment: PaymentDto) => {
    try {
      const response = await getPaymentById(payment.id);
      if (response.success && response.data) {
        setSelectedPayment(response.data);
        // Could open a detail dialog here
        toast.info(
          `Payment ${response.data.paymentReference || payment.id} details loaded`,
        );
      }
    } catch (error) {
      console.error("Error loading payment details:", error);
      toast.error("Failed to load payment details");
    }
  };

  const columns: DataTableColumn<PaymentDto>[] = [
    {
      id: "paymentReference",
      header: "Reference",
      accessorKey: "paymentReference",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.paymentReference || `PAY-${row.id}`}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      accessorKey: "amount",
      cell: ({ row }) => (
        <span className="font-semibold">
          {row.currency || "NGN"} {row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.status || row.paymentStatus || "Pending";
        const config = statusConfig[status] || statusConfig.Pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: "paymentMethod",
      header: "Method",
      accessorKey: "paymentMethod",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.paymentMethod || "N/A"}
        </span>
      ),
    },
    {
      id: "userName",
      header: "User",
      accessorKey: "userName",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.userName || "N/A"}</div>
          {row.userEmail && (
            <div className="text-sm text-muted-foreground">{row.userEmail}</div>
          )}
        </div>
      ),
    },
    {
      id: "invoiceNumber",
      header: "Invoice",
      accessorKey: "invoiceNumber",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.invoiceNumber || `INV-${row.invoiceId || "N/A"}`}
        </span>
      ),
    },
    {
      id: "paymentDate",
      header: "Date",
      accessorKey: "paymentDate",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.paymentDate
            ? formatDate(row.paymentDate)
            : formatDate(row.createdAt || "")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewPayment(row)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {row.paymentReference && (
              <DropdownMenuItem
                onClick={() => {
                  setPaymentReference(row.paymentReference || "");
                  setIsVerifyDialogOpen(true);
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify Payment
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track and manage payment records"
      />

      {/* Filters and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="There are no payment records to display"
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={payments}
            isLoading={isLoading}
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            searchable={false}
          />
        </>
      )}

      {/* Verify Payment Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Enter the payment reference to verify payment status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentReference">Payment Reference</Label>
              <Input
                id="paymentReference"
                placeholder="PAY-2024-001"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVerifyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleVerifyPayment} disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Manual Payment Dialog */}
      <Dialog
        open={isManualPaymentDialogOpen}
        onOpenChange={setIsManualPaymentDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Manual Payment</DialogTitle>
            <DialogDescription>
              Record a payment that was made outside the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoiceId">Invoice ID *</Label>
              <Input
                id="invoiceId"
                type="number"
                placeholder="123"
                value={manualPaymentForm.invoiceId}
                onChange={(e) =>
                  setManualPaymentForm({
                    ...manualPaymentForm,
                    invoiceId: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={manualPaymentForm.amount}
                onChange={(e) =>
                  setManualPaymentForm({
                    ...manualPaymentForm,
                    amount: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={manualPaymentForm.paymentMethod}
                onValueChange={(value) =>
                  setManualPaymentForm({
                    ...manualPaymentForm,
                    paymentMethod: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentReference">Payment Reference</Label>
              <Input
                id="paymentReference"
                placeholder="Optional reference number"
                value={manualPaymentForm.paymentReference}
                onChange={(e) =>
                  setManualPaymentForm({
                    ...manualPaymentForm,
                    paymentReference: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes (optional)"
                value={manualPaymentForm.notes}
                onChange={(e) =>
                  setManualPaymentForm({
                    ...manualPaymentForm,
                    notes: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsManualPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRecordManualPayment} disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
