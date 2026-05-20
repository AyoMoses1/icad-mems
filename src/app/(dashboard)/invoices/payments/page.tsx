"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  getMyPayments,
  verifyPayment,
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
  Paid: { label: "Paid", variant: "default" },
};

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const pageSize = 20;

  const [paymentReference, setPaymentReference] = useState("");

  useEffect(() => {
    loadPayments();
  }, [currentPage, searchTerm, statusFilter]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const response = await getMyPayments({
        pageNumber: currentPage,
        pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
        searchTerm: searchTerm.trim() || undefined,
      });

      if (response.success && response.data) {
        setPayments(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      } else {
        setPayments([]);
        setTotalPages(0);
        setTotalCount(0);
        if (response.message) {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error("Failed to load payments");
      setPayments([]);
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

  const handleViewPayment = (payment: PaymentDto) => {
    const ref = payment.paymentReference?.trim();
    if (!ref) {
      toast.error("This payment has no reference to open details");
      return;
    }
    router.push(`/invoices/payments/${encodeURIComponent(ref)}`);
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
        const config =
          statusConfig[status] ||
          statusConfig[status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()] ||
          statusConfig.Pending;
        return <Badge variant={config.variant}>{status}</Badge>;
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
            : row.createdAt
              ? formatDate(row.createdAt)
              : "—"}
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
        description="Your payment history from invoices and applications"
        actions={
          <Button variant="outline" onClick={loadPayments} disabled={isLoading}>
            Refresh
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference or invoice..."
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
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="Payments appear here after you pay an invoice for an application"
        />
      ) : (
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
      )}

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
    </div>
  );
}
