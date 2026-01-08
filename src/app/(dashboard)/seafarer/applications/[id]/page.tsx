"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  AlertTriangle,
  XCircle,
  Loader2,
  Receipt,
  Calendar,
  User,
  Building,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner, PageHeader } from "@/components/shared";
import {
  getApplicationById,
  getApplicationHistory,
  getApplicationInvoice,
  type ApplicationDto,
  type ApplicationHistoryDto,
  type ApplicationRequirementDto,
  type ApplicationInvoiceDto,
} from "@/lib/services/application-service";
import {
  initiateApplicationPayment,
  getApplicationPaymentStatus,
  type InitiatePaymentResponse,
  type PaymentStatusResponse,
} from "@/lib/services/payment-service";
import { formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 border-gray-300",
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-300",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800 border-yellow-300",
  REVIEW: "bg-yellow-100 text-yellow-800 border-yellow-300",
  PENDING_DOCUMENTS: "bg-orange-100 text-orange-800 border-orange-300",
  PEND_DOCS: "bg-orange-100 text-orange-800 border-orange-300",
  PAYMENT_PENDING: "bg-orange-100 text-orange-800 border-orange-300",
  PEND_PAY: "bg-orange-100 text-orange-800 border-orange-300",
  PAID: "bg-cyan-100 text-cyan-800 border-cyan-300",
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-300",
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const STATUS_ICONS: Record<string, any> = {
  DRAFT: Clock,
  SUBMITTED: FileText,
  UNDER_REVIEW: Clock,
  REVIEW: Clock,
  PAYMENT_PENDING: CreditCard,
  PEND_PAY: CreditCard,
  PAID: CheckCircle2,
  PROCESSING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  CANCELLED: XCircle,
  COMPLETED: CheckCircle2,
};

interface TimelineEvent {
  event: string;
  description: string;
  timestamp: string;
  performedBy?: string;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<ApplicationDto | null>(null);
  const [historyData, setHistoryData] = useState<ApplicationHistoryDto | null>(null);
  const [invoice, setInvoice] = useState<ApplicationInvoiceDto | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (applicationId) {
      loadApplicationData();
    }
  }, [applicationId]);

  const loadApplicationData = async () => {
    setIsLoading(true);
    try {
      // Load application details
      const appResponse = await getApplicationById(applicationId);
      const appOk = appResponse.success ?? (appResponse as any).successful;
      
      if (appOk && appResponse.data) {
        setApplication(appResponse.data);
      } else {
        toast.error(appResponse.message || "Failed to load application");
        return;
      }

      // Try to load history
      try {
        const historyResponse = await getApplicationHistory(applicationId);
        const histOk = historyResponse.success ?? (historyResponse as any).successful;
        if (histOk && historyResponse.data) {
          setHistoryData(historyResponse.data);
        }
      } catch (e) {
        console.log("History not available yet");
      }

      // Try to load invoice
      try {
        const invoiceResponse = await getApplicationInvoice(applicationId);
        const invOk = invoiceResponse.success ?? (invoiceResponse as any).successful;
        if (invOk && invoiceResponse.data) {
          setInvoice(invoiceResponse.data);
        }
      } catch (e) {
        console.log("Invoice not available yet");
      }

      // Try to load payment status
      try {
        const paymentResponse = await getApplicationPaymentStatus(applicationId);
        const payOk = paymentResponse.success ?? (paymentResponse as any).successful;
        if (payOk && paymentResponse.data) {
          setPaymentStatus(paymentResponse.data);
        }
      } catch (e) {
        console.log("Payment status not available yet");
      }
    } catch (error: any) {
      console.error("Error loading application:", error);
      toast.error(error.message || "Failed to load application");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!applicationId) return;

    setIsProcessingPayment(true);
    try {
      const response = await initiateApplicationPayment(applicationId);
      const ok = response.success ?? (response as any).successful;

      if (ok && response.data) {
        const redirectUrl = response.data.paymentUrl || response.data.authorizationUrl;
        if (redirectUrl) {
          window.open(redirectUrl, "_blank");
          toast.success("Redirecting to payment gateway...");
        } else {
          toast.error("Payment URL not available");
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

  const getStatusBadge = (status?: string | null) => {
    const normalizedStatus = status?.toUpperCase().replace(/ /g, "_") || "DRAFT";
    const StatusIcon = STATUS_ICONS[normalizedStatus] || Clock;
    return (
      <Badge
        variant="outline"
        className={`${STATUS_COLORS[normalizedStatus] || "bg-gray-100"} flex items-center gap-1`}
      >
        <StatusIcon className="h-3 w-3" />
        {status?.replace(/_/g, " ") || "Draft"}
      </Badge>
    );
  };

  const getRequirementsProgress = () => {
    if (!application?.requirements || application.requirements.length === 0) {
      return 0;
    }
    const completed = application.requirements.filter((r) => r.isSubmitted).length;
    return Math.round((completed / application.requirements.length) * 100);
  };

  const isPaymentPending = () => {
    const status = application?.status?.toUpperCase() || application?.applicationStatus?.toUpperCase();
    return status === "PAYMENT_PENDING" || status === "PEND_PAY";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Application not found</p>
        </div>
      </div>
    );
  }

  const currentStatus = application.status || application.applicationStatus || "DRAFT";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Application {application.id?.slice(0, 8).toUpperCase()}
              </h1>
              {getStatusBadge(currentStatus)}
            </div>
            <p className="text-muted-foreground">
              {application.serviceName || "Service Application"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPaymentPending() && (
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePayNow}
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
        </div>
      </div>

      {/* Status Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Application Progress</span>
              {getStatusBadge(currentStatus)}
            </div>
            <span className="text-sm text-muted-foreground">
              {getRequirementsProgress()}% Complete
            </span>
          </div>
          <Progress value={getRequirementsProgress()} className="h-2" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Application ID</p>
                    <p className="font-mono font-medium">
                      {application.id?.slice(0, 13).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-medium">{application.serviceName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm">
                      {application.createdAt || application.dateCreated
                        ? formatDate(application.createdAt || application.dateCreated || "")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="text-sm">
                      {application.submissionDate || application.applicationDate
                        ? formatDate(application.submissionDate || application.applicationDate || "")
                        : "Not submitted"}
                    </p>
                  </div>
                </div>
                {application.remarks && (
                  <div>
                    <p className="text-sm text-muted-foreground">Remarks</p>
                    <p className="text-sm bg-muted p-3 rounded-md mt-1">
                      {application.remarks}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">Current Status</span>
                  {getStatusBadge(currentStatus)}
                </div>
                {application.hasInvoice && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Invoice</span>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      {application.invoiceStatus || "Generated"}
                    </Badge>
                  </div>
                )}
                {application.hasPayment && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Payment</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              {application.requirements && application.requirements.length > 0 ? (
                <div className="space-y-3">
                  {application.requirements.map((req, idx) => (
                    <div
                      key={req.id || req.applicationRequirementId || idx}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {req.isSubmitted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <p className="font-medium">{req.requirementName || "Requirement"}</p>
                          {req.requirementDescription && (
                            <p className="text-sm text-muted-foreground">
                              {req.requirementDescription}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          req.isSubmitted
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {req.isSubmitted ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No requirements recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attached Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {historyData?.documents && historyData.documents.length > 0 ? (
                <div className="space-y-3">
                  {(historyData.documents as any[]).map((doc: any, idx: number) => (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {doc.documentType || doc.fileName || "Document"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded: {doc.uploadedAt ? formatDate(doc.uploadedAt) : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents attached yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {historyData?.statusHistory && (historyData.statusHistory as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(historyData.statusHistory as TimelineEvent[]).map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-600" />
                        {idx < (historyData.statusHistory as any[]).length - 1 && (
                          <div className="w-0.5 h-full bg-muted flex-1 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{event.description || event.event}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          {event.performedBy && (
                            <>
                              <User className="h-3 w-3" />
                              <span>{event.performedBy}</span>
                              <span>•</span>
                            </>
                          )}
                          <Calendar className="h-3 w-3" />
                          <span>{event.timestamp ? formatDate(event.timestamp) : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Default timeline based on application data */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-600" />
                      <div className="w-0.5 h-full bg-muted flex-1 mt-1" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">Application Created</p>
                      <p className="text-sm text-muted-foreground">
                        {application.createdAt || application.dateCreated
                          ? formatDate(application.createdAt || application.dateCreated || "")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {(application.submissionDate || application.applicationDate) && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-600" />
                        <div className="w-0.5 h-full bg-muted flex-1 mt-1" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">Application Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(application.submissionDate || application.applicationDate || "")}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Current Status: {currentStatus.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Invoice Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoice || application.hasInvoice ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Invoice Number</p>
                      <p className="font-mono font-bold">
                        {invoice?.invoiceNumber || application.invoiceId?.slice(0, 8).toUpperCase() || "N/A"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-bold text-lg">
                          {invoice?.currency || "NGN"}{" "}
                          {((invoice?.totalAmount ?? invoice?.amount) ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge
                          variant="outline"
                          className={
                            invoice?.status?.toLowerCase() === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {invoice?.status || application.invoiceStatus || "Pending"}
                        </Badge>
                      </div>
                    </div>
                    {invoice?.dueDate && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Due Date</p>
                        <p>{formatDate(invoice.dueDate)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No invoice generated yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentStatus?.hasPayment || application.hasPayment ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">Payment Complete</p>
                        <p className="text-sm text-green-700">
                          Your payment has been processed successfully.
                        </p>
                      </div>
                    </div>
                    {(paymentStatus?.paymentRef || application.paymentRef) && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Payment Reference</p>
                        <p className="font-mono">
                          {paymentStatus?.paymentRef || application.paymentRef}
                        </p>
                      </div>
                    )}
                    {paymentStatus?.paymentDate && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Payment Date</p>
                        <p>{formatDate(paymentStatus.paymentDate)}</p>
                      </div>
                    )}
                  </div>
                ) : isPaymentPending() ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="font-semibold text-orange-800">Payment Required</p>
                        <p className="text-sm text-orange-700">
                          Please complete payment to proceed with your application.
                        </p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handlePayNow}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Proceed to Payment
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Payment not required at this stage</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}



