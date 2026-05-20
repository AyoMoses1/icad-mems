"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CreditCard, FileText, Receipt } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, LoadingSpinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import {
  getInvoicePaymentDetailByRef,
  type InvoicePaymentDetailResult,
} from "@/lib/services/payment-service";

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

function displayId(value?: string | null): string {
  const v = value?.trim();
  if (!v || v.toLowerCase() === NIL_UUID.toLowerCase()) return "—";
  return v;
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-4 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={`text-sm font-medium break-words ${mono ? "font-mono text-xs sm:text-sm" : ""}`}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

export default function PaymentDetailPage() {
  const params = useParams();
  const rawRef = params.paymentRef;
  const paymentRef =
    typeof rawRef === "string"
      ? decodeURIComponent(rawRef)
      : Array.isArray(rawRef)
        ? decodeURIComponent(rawRef[0] || "")
        : "";

  const [detail, setDetail] = useState<InvoicePaymentDetailResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!paymentRef.trim()) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);
      try {
        const response = await getInvoicePaymentDetailByRef(paymentRef);
        if (cancelled) return;

        const ok = response.success === true || (response as { successful?: boolean }).successful === true;
        if (ok && response.data) {
          setDetail(response.data);
        } else {
          setDetail(null);
          setNotFound(true);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setDetail(null);
          setNotFound(true);
          toast.error("Failed to load payment details");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [paymentRef]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment details" description="Loading…" />
        <LoadingSpinner />
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Payment details"
          description="We could not find this payment in your invoices."
        />
        <Button variant="outline" asChild>
          <Link href="/invoices/payments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to payments
          </Link>
        </Button>
      </div>
    );
  }

  const { invoice, payment, invoicePayments } = detail;
  const currency = invoice.currency || "NGN";
  const paymentStatus = payment.paymentStatus || invoice.paymentStatus || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Payment details"
          description={`Reference ${payment.paymentRef || paymentRef}`}
        />
        <Button variant="outline" asChild className="shrink-0 self-start">
          <Link href="/invoices/payments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to payments
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Invoice</CardTitle>
            </div>
            <CardDescription>
              Invoice linked to this payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <DetailRow label="Invoice number" value={invoice.invoiceNumber} mono />
              <DetailRow label="Invoice status" value={
                <Badge variant="outline">{invoice.invoiceStatus || "—"}</Badge>
              } />
              <DetailRow
                label="Amount"
                value={`${currency} ${(invoice.amount ?? 0).toLocaleString()}`}
              />
              <DetailRow label="Currency" value={currency} />
              <DetailRow
                label="Invoice date"
                value={invoice.invoiceDate ? formatDate(invoice.invoiceDate) : "—"}
              />
              <DetailRow
                label="Record created"
                value={invoice.dateCreated ? formatDate(invoice.dateCreated) : "—"}
              />
              <DetailRow label="Invoice ID" value={displayId(invoice.invoiceId)} mono />
              <DetailRow label="Invoice status ID" value={displayId(invoice.invoiceStatusId)} mono />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Application</CardTitle>
            </div>
            <CardDescription>Service and application context</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <DetailRow label="Application reference" value={invoice.rn || "—"} mono />
              <DetailRow label="Application status" value={
                <Badge variant="secondary">{invoice.applicationStatus || "—"}</Badge>
              } />
              <DetailRow
                label="Application date"
                value={invoice.applicationDate ? formatDate(invoice.applicationDate) : "—"}
              />
              <DetailRow label="Service" value={invoice.serviceName || "—"} />
              <DetailRow label="Application ID" value={displayId(invoice.applicationId)} mono />
              <DetailRow label="Service ID" value={displayId(invoice.serviceId)} mono />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Selected payment</CardTitle>
            </div>
            <Badge>{paymentStatus}</Badge>
          </div>
          <CardDescription>
            Transaction details from your invoice payment record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <DetailRow label="Payment reference" value={payment.paymentRef} mono />
            <DetailRow
              label="Amount"
              value={`${currency} ${(payment.amount ?? invoice.amount ?? 0).toLocaleString()}`}
            />
            <DetailRow
              label="Payment date"
              value={payment.paymentDate ? formatDate(payment.paymentDate) : "—"}
            />
            <DetailRow
              label="Record created"
              value={payment.dateCreated ? formatDate(payment.dateCreated) : "—"}
            />
            <DetailRow label="Payment status ID" value={displayId(payment.paymentStatusId)} mono />
            <DetailRow
              label="Provider"
              value={payment.paymentServiceProvider || "—"}
            />
            <DetailRow
              label="Provider ID"
              value={displayId(payment.paymentServiceProviderId)}
              mono
            />
            <DetailRow label="Invoice ID" value={displayId(payment.invoiceId || invoice.invoiceId)} mono />
          </dl>
        </CardContent>
      </Card>

      {invoicePayments.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All payments on this invoice</CardTitle>
            <CardDescription>
              This invoice has multiple payment records. The selected one is highlighted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoicePayments.map((p) => {
              const isSelected = (p.paymentRef || "").trim() === (payment.paymentRef || "").trim();
              return (
                <div
                  key={`${p.paymentRef}-${p.dateCreated}`}
                  className={`rounded-lg border p-4 ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm">{p.paymentRef}</span>
                    <Badge variant={isSelected ? "default" : "outline"}>
                      {p.paymentStatus || "—"}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground">Amount: </span>
                      <span className="font-medium">
                        {currency} {(p.amount ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date: </span>
                      <span className="font-medium">
                        {p.paymentDate ? formatDate(p.paymentDate) : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
