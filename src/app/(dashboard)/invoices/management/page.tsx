"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
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
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
} from "@/components/shared";
import type { ApplicationInvoiceDto } from "@/types/payment";
import { formatDate } from "@/lib/utils";
import {
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "@/lib/services/invoice-service";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  Paid: { label: "Paid", variant: "default" },
  Pending: { label: "Pending", variant: "secondary" },
  Overdue: { label: "Overdue", variant: "destructive" },
  Cancelled: { label: "Cancelled", variant: "destructive" },
  Draft: { label: "Draft", variant: "outline" },
};

export default function InvoiceManagementPage() {
  const [invoices, setInvoices] = useState<ApplicationInvoiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<ApplicationInvoiceDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const pageSize = 20;

  const [formData, setFormData] = useState({
    applicationId: "",
    amount: "",
    currency: "NGN",
    description: "",
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    loadInvoices();
  }, [currentPage, searchTerm, statusFilter]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await getInvoices({
        pageNumber: currentPage,
        pageSize,
        statusId: statusFilter !== "all" ? parseInt(statusFilter) : undefined,
        searchTerm: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setInvoices(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      } else {
        toast.error(response.message || "Failed to load invoices");
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedInvoice) return;

    setIsSubmitting(true);
    try {
      const response = await updateInvoice(selectedInvoice.id, {
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        currency: formData.currency,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
        description: formData.description || undefined,
      });

      if (response.success && response.data) {
        toast.success("Invoice updated successfully");
        setIsEditOpen(false);
        resetForm();
        loadInvoices();
      } else {
        toast.error(response.message || "Failed to update invoice");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;

    setIsSubmitting(true);
    try {
      const response = await deleteInvoice(selectedInvoice.id);
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Invoice deleted successfully");
        setIsDeleteOpen(false);
        setSelectedInvoice(null);
        loadInvoices();
      } else {
        toast.error(response.message || "Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewInvoice = async (invoice: ApplicationInvoiceDto) => {
    try {
      const response = await getInvoiceById(invoice.id);
      if (response.success && response.data) {
        setSelectedInvoice(response.data);
        // Could open a detail dialog here
        toast.info(
          `Invoice ${response.data.invoiceNumber || invoice.id} details loaded`
        );
      }
    } catch (error) {
      console.error("Error loading invoice details:", error);
      toast.error("Failed to load invoice details");
    }
  };

  const resetForm = () => {
    setFormData({
      applicationId: "",
      amount: "",
      currency: "NGN",
      description: "",
      dueDate: "",
      notes: "",
    });
    setSelectedInvoice(null);
  };

  const openEditDialog = (invoice: ApplicationInvoiceDto) => {
    setSelectedInvoice(invoice);
    setFormData({
      applicationId: invoice.applicationId?.toString() || "",
      amount: invoice.amount.toString(),
      currency: invoice.currency || "NGN",
      description: "",
      dueDate: invoice.dueDate
        ? new Date(invoice.dueDate).toISOString().split("T")[0]
        : "",
      notes: invoice.notes || "",
    });
    setIsEditOpen(true);
  };

  const columns: DataTableColumn<ApplicationInvoiceDto>[] = [
    {
      id: "invoiceNumber",
      header: "Invoice Number",
      accessorKey: "invoiceNumber",
      cell: (row) => (
        <span className="font-mono font-medium">
          {row.invoiceNumber || `INV-${row.id}`}
        </span>
      ),
    },
    {
      id: "applicationNumber",
      header: "Application",
      accessorKey: "applicationNumber",
      cell: (row) => (
        <span className="text-sm">
          {row.applicationNumber || `APP-${row.applicationId || "N/A"}`}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      accessorKey: "amount",
      cell: (row) => (
        <span className="font-semibold">
          {row.currency || "NGN"} {row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "invoiceStatusName",
      cell: (row) => {
        const status =
          row.invoiceStatusName || row.invoiceStatusCode || "Pending";
        const config = statusConfig[status] || statusConfig.Pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: "userName",
      header: "User",
      accessorKey: "userName",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.userName || "N/A"}</div>
          {row.userEmail && (
            <div className="text-sm text-muted-foreground">{row.userEmail}</div>
          )}
        </div>
      ),
    },
    {
      id: "dueDate",
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (row) => (
        <span className="text-sm">
          {row.dueDate ? formatDate(row.dueDate) : "N/A"}
        </span>
      ),
    },
    {
      id: "paidDate",
      header: "Paid Date",
      accessorKey: "paidDate",
      cell: (row) => (
        <span className="text-sm">
          {row.paidDate ? formatDate(row.paidDate) : "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewInvoice(row)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditDialog(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Invoice
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSelectedInvoice(row);
                setIsDeleteOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Management"
        description="Create and manage invoices"
      />

      {/* Filters and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter || "all"}
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
              <SelectItem value="1">Pending</SelectItem>
              <SelectItem value="2">Paid</SelectItem>
              <SelectItem value="3">Overdue</SelectItem>
              <SelectItem value="4">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Invoices Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="There are no invoices to display."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={invoices}
            isLoading={isLoading}
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            searchable={false}
          />
        </>
      )}

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>Update invoice details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-currency">Currency</Label>
              <Input
                id="edit-currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${selectedInvoice?.invoiceNumber || selectedInvoice?.id}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}

