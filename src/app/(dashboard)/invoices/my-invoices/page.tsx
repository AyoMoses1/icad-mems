"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  CreditCard,
  Download,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingSpinner, PageHeader, EmptyState } from "@/components/shared";
import {
  getMyInvoices,
  mapInvoiceToSeafarerDto,
  initiateApplicationPayment,
  downloadInvoice,
  type SeafarerInvoiceDto,
} from "@/lib/services/payment-service";
import { formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  UNPAID: "bg-orange-100 text-orange-800 border-orange-300",
  PAID: "bg-green-100 text-green-800 border-green-300",
  OVERDUE: "bg-red-100 text-red-800 border-red-300",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function MyInvoicesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<SeafarerInvoiceDto[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<SeafarerInvoiceDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await getMyInvoices({ pageNumber: 1, pageSize: 100 });
      const ok = response.success ?? (response as { successful?: boolean }).successful;

      if (ok && response.data?.items) {
        setInvoices(response.data.items.map(mapInvoiceToSeafarerDto));
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Failed to load invoices:", error);
      // Don't show error toast if API just doesn't exist yet
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async (invoice: SeafarerInvoiceDto) => {
    if (!invoice.applicationId) {
      toast.error("Cannot process payment: No application associated with this invoice");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await initiateApplicationPayment(invoice.applicationId);
      const ok = response.success ?? (response as any).successful;

      if (ok && response.data) {
        const paymentData = response.data;
        const redirectUrl = paymentData.paymentUrl || paymentData.authorizationUrl;
        
        if (redirectUrl) {
          // Open payment gateway in new tab
          window.open(redirectUrl, "_blank");
          toast.success("Redirecting to payment gateway...");
          setPaymentUrl(redirectUrl);
        } else {
          toast.error("Payment URL not available. Please try again.");
        }
      } else {
        toast.error(response.message || "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Error initiating payment:", error);
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadInvoice = async (invoice: SeafarerInvoiceDto) => {
    try {
      const blob = await downloadInvoice(invoice.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNumber || invoice.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const handleViewDetails = (invoice: SeafarerInvoiceDto) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const getStatusIcon = (status?: string | null) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "PAID":
        return <CheckCircle className="h-4 w-4" />;
      case "OVERDUE":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount?: number, currency?: string | null) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
    }).format(amount);
  };

  const isPending = (status?: string | null) => {
    const normalizedStatus = status?.toUpperCase();
    return normalizedStatus === "PENDING" || normalizedStatus === "UNPAID";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Invoices"
        description="View and manage your invoices and payments"
        actions={
          <Button variant="outline" onClick={loadInvoices} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Invoices ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices found"
              description="Invoices will appear here when you submit applications"
            />
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.serviceName || "Application Invoice"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {invoice.dueDate ? formatDate(invoice.dueDate) : "N/A"}
                      </p>
                      {invoice.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          Created: {formatDate(invoice.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(invoice.totalAmount ?? invoice.amount, invoice.currency)}
                      </p>
                      <Badge 
                        variant="outline"
                        className={STATUS_COLORS[invoice.status?.toUpperCase() || ""] || "bg-gray-100"}
                      >
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status || "PENDING"}</span>
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {isPending(invoice.status) && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handlePayNow(invoice)}
                          disabled={isProcessingPayment}
                        >
                          {isProcessingPayment ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay
                            </>
                          )}
                      </Button>
                    )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono font-bold text-lg">
                    {selectedInvoice.invoiceNumber || `INV-${selectedInvoice.id.slice(0, 8).toUpperCase()}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice.serviceName}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[selectedInvoice.status?.toUpperCase() || ""] || "bg-gray-100"}
                >
                  {selectedInvoice.status || "PENDING"}
                </Badge>
              </div>

              {/* Amount Section */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(selectedInvoice.totalAmount ?? selectedInvoice.amount, selectedInvoice.currency)}
                </p>
              </div>

              {/* Line Items */}
              {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">Line Items</p>
                  <div className="border rounded-lg divide-y">
                    {selectedInvoice.lineItems.map((item, idx) => (
                      <div key={idx} className="p-3 flex justify-between">
                        <span className="text-sm">{item.description}</span>
                        <span className="font-medium">
                          {formatCurrency(item.total, selectedInvoice.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-medium">
                    {selectedInvoice.issuedAt || selectedInvoice.createdAt
                      ? formatDate(selectedInvoice.issuedAt || selectedInvoice.createdAt || "")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : "N/A"}
                  </p>
                </div>
                {selectedInvoice.paidDate && (
                  <div>
                    <p className="text-muted-foreground">Paid Date</p>
                    <p className="font-medium">{formatDate(selectedInvoice.paidDate)}</p>
                  </div>
                )}
                {selectedInvoice.paymentReference && (
                  <div>
                    <p className="text-muted-foreground">Payment Reference</p>
                    <p className="font-mono text-xs">{selectedInvoice.paymentReference}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedInvoice && isPending(selectedInvoice.status) && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setIsDetailOpen(false);
                  handlePayNow(selectedInvoice);
                }}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Pay Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
